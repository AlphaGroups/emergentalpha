"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Info } from "lucide-react";
import { API } from "@/config/constants";
import axios from "axios";

const PackagesPage = () => {
  const [packages, setPackages] = useState({ configs: [], features: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API}/packages`);
        setPackages(response.data);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  const { configs, features } = packages;
  const packageNames = ["classic", "select", "signature", "customize"];

  const getPackageConfig = (name) => configs.find((c) => c.name === name) || {};

  return (
    <div data-testid="packages-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#010822] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Construction Packages
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto">
            Choose from 4 carefully curated packages designed to match your
            budget and aspirations. Transparent pricing with detailed material
            specifications.
          </p>
        </div>
      </section>

      {/* Package Cards Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {packageNames.map((pkgName, idx) => {
              const config = getPackageConfig(pkgName);
              const isPopular = pkgName === "select";

              return (
                <div
                  key={pkgName}
                  data-testid={`package-card-${pkgName}`}
                  className={`relative bg-white border-2 p-6 rounded-sm transition-all hover:shadow-xl ${
                    isPopular
                      ? "border-[#F97316] scale-105"
                      : "border-slate-200 hover:border-[#2a4599]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#010822] capitalize mb-2">
                      {pkgName}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                      {config.description}
                    </p>

                    <div className="mb-6">
                      {pkgName === "customize" ? (
                        <div className="text-2xl font-bold text-[#2a4599]">
                          Custom Quote
                        </div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-[#2a4599]">
                            ₹{config.price_per_sft?.toLocaleString()}
                          </div>
                          <div className="text-slate-500 text-sm">
                            per sq.ft
                          </div>
                        </>
                      )}
                    </div>

                    <Link to={`/calculator?package=${pkgName}`}>
                      <Button
                        data-testid={`select-${pkgName}`}
                        className={`w-full py-3 font-bold rounded-sm ${
                          isPopular
                            ? "bg-[#F97316] hover:bg-[#ea580c] text-white"
                            : "bg-[#2a4599] hover:bg-[#1e3a8a] text-white"
                        }`}
                      >
                        Get Estimate
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-slate-50" data-testid="comparison-table">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Detailed Comparison
            </h2>
            <p className="text-slate-600">
              Compare specifications across all packages
            </p>
          </div>

          <div className="bg-white rounded-sm shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-[#010822] text-white">
              <div className="p-4 font-bold text-sm border-r border-white/20">
                Specifications
              </div>
              {packageNames.map((name) => (
                <div
                  key={name}
                  className={`p-4 text-center font-bold text-sm capitalize ${
                    name === "select" ? "bg-[#F97316]" : ""
                  }`}
                >
                  {name}
                  {name !== "customize" && (
                    <div className="text-xs font-normal mt-1 opacity-80">
                      ₹{getPackageConfig(name).price_per_sft?.toLocaleString()}
                      /sft
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table Body */}
            {features.map((feature, idx) => (
              <div
                key={feature.id}
                className={`grid grid-cols-5 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50/50 transition-colors`}
              >
                <div className="p-4 font-medium text-[#010822] border-r border-slate-100 text-sm">
                  {feature.name}
                </div>
                <div className="p-4 text-center text-sm text-slate-600 border-r border-slate-100">
                  {feature.classic}
                </div>
                <div className="p-4 text-center text-sm text-slate-600 border-r border-slate-100 bg-orange-50/30">
                  {feature.select}
                </div>
                <div className="p-4 text-center text-sm text-slate-600 border-r border-slate-100">
                  {feature.signature}
                </div>
                <div className="p-4 text-center text-sm text-slate-600">
                  {feature.customize}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fixed Price Guarantee",
                desc: "No hidden costs. The price we quote is the price you pay.",
              },
              {
                title: "Quality Materials",
                desc: "All packages use ISI-certified, branded materials only.",
              },
              {
                title: "Transparent Process",
                desc: "Track every stage of construction with real-time updates.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 bg-[#2a4599]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="text-[#2a4599]" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#010822] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2a4599]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Build Your Dream Home?
          </h2>
          <p className="text-slate-200 mb-8">
            Get an instant cost estimate with our free calculator
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calculator">
              <Button
                data-testid="packages-calculator-cta"
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm"
              >
                Calculate Your Cost
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#2a4599] font-bold px-10 py-6 text-lg rounded-sm"
              >
                Talk to Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PackagesPage;
