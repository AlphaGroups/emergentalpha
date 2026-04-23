"""Database module using psycopg2 for direct PostgreSQL access to Supabase."""
import psycopg2
import psycopg2.pool
import psycopg2.extras
from psycopg2.extras import Json, RealDictCursor
import os
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        dsn = os.environ.get('POSTGRES_URL')
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn=2, maxconn=10, dsn=dsn)
        logger.info("Database connection pool created")
    return _pool


def _serialize_value(v):
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, date):
        return v.isoformat()
    return v


def _serialize_row(row):
    if row is None:
        return None
    return {k: _serialize_value(v) for k, v in row.items()}


def query(sql, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
            return [_serialize_row(dict(r)) for r in rows]
    finally:
        pool.putconn(conn)


def query_one(sql, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return _serialize_row(dict(row)) if row else None
    finally:
        pool.putconn(conn)


def execute(sql, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
            return cur.rowcount
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        pool.putconn(conn)


def execute_returning(sql, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            conn.commit()
            rows = cur.fetchall()
            return [_serialize_row(dict(r)) for r in rows]
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        pool.putconn(conn)


def count(sql, params=None):
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            result = cur.fetchone()
            return result[0] if result else 0
    finally:
        pool.putconn(conn)


def _prep_value(v):
    if isinstance(v, (list, dict)):
        return Json(v)
    return v


def insert(table, data):
    cols = ', '.join(f'"{k}"' for k in data.keys())
    placeholders = ', '.join(['%s'] * len(data))
    values = [_prep_value(v) for v in data.values()]
    sql = f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders})'
    execute(sql, values)


def insert_many(table, rows):
    if not rows:
        return
    cols = ', '.join(f'"{k}"' for k in rows[0].keys())
    placeholders = ', '.join(['%s'] * len(rows[0]))
    sql = f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders})'
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            for row in rows:
                values = [_prep_value(v) for v in row.values()]
                cur.execute(sql, values)
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        pool.putconn(conn)


def update(table, data, where_col, where_val):
    set_parts = ', '.join(f'"{k}" = %s' for k in data.keys())
    values = [_prep_value(v) for v in data.values()]
    values.append(where_val)
    sql = f'UPDATE "{table}" SET {set_parts} WHERE "{where_col}" = %s RETURNING *'
    return execute_returning(sql, values)


def delete(table, where_col, where_val):
    sql = f'DELETE FROM "{table}" WHERE "{where_col}" = %s RETURNING *'
    return execute_returning(sql, [where_val])
