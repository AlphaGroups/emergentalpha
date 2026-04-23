"""Database module using Supabase REST API."""
import os
import logging
import re
from supabase import create_client, Client

logger = logging.getLogger(__name__)

_client = None

def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ.get('SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_ANON_KEY')
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(url, key)
        logger.info("Supabase REST client initialized")
    return _client

def _parse_select(sql, params):
    client = get_client()
    sql = sql.replace('"', '')
    
    # COUNT query
    if 'SELECT COUNT(*)' in sql.upper():
        match = re.search(r'FROM\s+(\w+)(?:\s+WHERE\s+(.+))?', sql, re.IGNORECASE)
        if not match:
            return 0
        table = match.group(1)
        where_clause = match.group(2)
        
        req = client.table(table).select('*', count='exact')
        
        if where_clause:
            # handle simple AND conditions
            conditions = re.split(r'\s+AND\s+', where_clause, flags=re.IGNORECASE)
            param_idx = 0
            for cond in conditions:
                cond = cond.strip()
                if 'IN (' in cond.upper():
                    # e.g. status IN ('contacted','in_progress')
                    col = cond.split('IN')[0].strip()
                    vals = re.search(r'\((.*?)\)', cond).group(1)
                    vals_list = [v.strip("' ") for v in vals.split(',')]
                    req = req.in_(col, vals_list)
                elif 'IS NOT NULL' in cond.upper():
                    col = cond.replace('IS NOT NULL', '').strip()
                    req = req.not_is(col, "null")
                elif '!=' in cond:
                    col, val = [x.strip() for x in cond.split('!=')]
                    if val == "''":
                        req = req.neq(col, '')
                    else:
                        req = req.neq(col, params[param_idx] if params else val)
                        param_idx += 1
                elif '=' in cond:
                    col, val = [x.strip() for x in cond.split('=')]
                    if val == '%s':
                        req = req.eq(col, params[param_idx])
                        param_idx += 1
                    else:
                        req = req.eq(col, val.strip("' "))
        res = req.execute()
        return res.count if res.count is not None else len(res.data)

    # SELECT query
    match = re.search(r'SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?)\s+(ASC|DESC))?$', sql, re.IGNORECASE)
    if not match:
        raise ValueError(f"Could not parse SQL: {sql}")
    
    select_cols = match.group(1).strip()
    table = match.group(2).strip()
    where_clause = match.group(3)
    order_col = match.group(4)
    order_dir = match.group(5)
    
    req = client.table(table).select(select_cols)
    
    if where_clause:
        conditions = re.split(r'\s+AND\s+|\s+OR\s+', where_clause, flags=re.IGNORECASE)
        # Note: Or is tricky. We'll simplify: if 'OR' is in where_clause, we use .or_()
        if ' OR ' in where_clause.upper():
            # e.g. phone = %s OR email = %s
            or_conds = []
            param_idx = 0
            for cond in conditions:
                if '=' in cond:
                    col = cond.split('=')[0].strip()
                    or_conds.append(f"{col}.eq.{params[param_idx]}")
                    param_idx += 1
            req = req.or_(','.join(or_conds))
        else:
            param_idx = 0
            for cond in conditions:
                if 'IS NOT NULL' in cond.upper():
                    col = cond.replace('IS NOT NULL', '').strip()
                    req = req.not_is(col, "null")
                elif '=' in cond:
                    col, val = [x.strip() for x in cond.split('=')]
                    if val == '%s':
                        req = req.eq(col, params[param_idx])
                        param_idx += 1
                    else:
                        req = req.eq(col, val.strip("' "))
                        
    if order_col:
        req = req.order(order_col.strip(), desc=(order_dir.upper() == 'DESC'))
        
    return req.execute().data

def query(sql, params=None):
    return _parse_select(sql, params)

def query_one(sql, params=None):
    data = _parse_select(sql, params)
    return data[0] if data else None

def count(sql, params=None):
    return _parse_select(sql, params)

def execute(sql, params=None):
    client = get_client()
    sql = sql.replace('"', '')
    if 'UPDATE' in sql.upper():
        match = re.search(r'UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)', sql, re.IGNORECASE)
        if match:
            table = match.group(1)
            set_clause = match.group(2)
            where_clause = match.group(3)
            
            # e.g. "password = %s" or "order = %s"
            set_cols = [x.split('=')[0].strip() for x in set_clause.split(',')]
            update_data = {}
            param_idx = 0
            for col in set_cols:
                update_data[col] = params[param_idx]
                param_idx += 1
                
            req = client.table(table).update(update_data)
            
            # where clause e.g. email = %s
            where_col = where_clause.split('=')[0].strip()
            req = req.eq(where_col, params[param_idx])
            
            return len(req.execute().data)
    raise NotImplementedError(f"Execute parsing not fully implemented for: {sql}")

def insert(table, data):
    client = get_client()
    return client.table(table).insert(data).execute().data

def insert_many(table, rows):
    if not rows:
        return []
    client = get_client()
    return client.table(table).insert(rows).execute().data

def update(table, data, where_col, where_val):
    client = get_client()
    return client.table(table).update(data).eq(where_col, where_val).execute().data

def delete(table, where_col, where_val):
    client = get_client()
    return client.table(table).delete().eq(where_col, where_val).execute().data
