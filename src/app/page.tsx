"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Store,
  Bot,
  ArrowLeftRight,
  Handshake,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { ServiceCard } from "@/components/marketplace/service-card";
import { ServiceDetail } from "@/components/marketplace/service-detail";
import { AgentTable } from "@/components/agents/agent-table";
import { AgentDetail } from "@/components/agents/agent-detail";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { NegotiationPanel } from "@/components/negotiations/negotiation-panel";
import { DisputeList } from "@/components/disputes/dispute-list";
import type {
  MarketplaceStats,
  ServiceListing,
  Agent,
  Transaction,
  Negotiation,
  Dispute,
  EscrowAccount,
} from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [escrows, setEscrows] = useState<EscrowAccount[]>([]);

  const fetchData = useCallback(async () => {
    const [statsRes, servicesRes, agentsRes, txRes, negRes, disputeRes] =
      await Promise.all([
        fetch("/api/stats"),
        fetch("/api/services"),
        fetch("/api/agents"),
        fetch("/api/transactions"),
        fetch("/api/negotiations"),
        fetch("/api/disputes"),
      ]);

    setStats(await statsRes.json());
    setServices(await servicesRes.json());
    setAgents(await agentsRes.json());
    setTransactions(await txRes.json());
    setNegotiations(await negRes.json());
    setDisputes(await disputeRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredServices = searchQuery
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.capabilities.some((c) =>
            c.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : services;

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "marketplace", label: "Marketplace", icon: Store },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "negotiations", label: "Negotiations", icon: Handshake },
    { id: "disputes", label: "Disputes", icon: AlertTriangle },
  ];

  if (!stats) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-md bg-teal/15 flex items-center justify-center mx-auto mb-3 glow-teal">
            <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-mono text-muted-foreground tracking-wider">
            INITIALIZING NETWORK...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid relative scanline">
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v);
          setSelectedService(null);
          setSelectedAgent(null);
          setSelectedTx(null);
        }}>
          <TabsList className="bg-surface-raised border border-border h-9 p-0.5 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs font-medium data-[state=active]:bg-teal/10 data-[state=active]:text-teal data-[state=active]:shadow-none h-8 px-3 gap-1.5"
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4 mt-0">
            <StatsCards stats={stats} />
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <VolumeChart stats={stats} />
              </div>
              <CategoryBreakdown stats={stats} />
            </div>
            {/* Recent transactions preview */}
            <div className="rounded-md border bg-card p-4 animate-fade-in delay-5">
              <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3">
                RECENT ACTIVITY
              </h3>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => {
                  const consumer = agentMap.get(tx.consumerId);
                  const provider = agentMap.get(tx.providerId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                    >
                      <div className="text-xs text-foreground">
                        <span className="text-teal-dim">{consumer?.name?.split(" ").slice(0, 2).join(" ") || "?"}</span>
                        <span className="text-muted-foreground mx-1.5">&rarr;</span>
                        <span>{provider?.name?.split(" ").slice(0, 2).join(" ") || "?"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-amber">
                          ${tx.amount.toFixed(2)}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            tx.status === "completed"
                              ? "bg-teal/10 text-teal"
                              : tx.status === "disputed"
                                ? "bg-danger/10 text-danger"
                                : "bg-blue-400/10 text-blue-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Marketplace */}
          <TabsContent value="marketplace" className="mt-0">
            {selectedService ? (
              <ServiceDetail
                service={selectedService}
                provider={agentMap.get(selectedService.providerId)}
                onBack={() => setSelectedService(null)}
                onNegotiate={() => {
                  setActiveTab("negotiations");
                  setSelectedService(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search services, capabilities, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-surface-raised border-border text-sm h-9 font-mono placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {filteredServices.length} services
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredServices
                    .filter((s) => s.status === "listed")
                    .map((service, i) => (
                      <div
                        key={service.id}
                        className={`animate-fade-in delay-${Math.min(i + 1, 6)}`}
                      >
                        <ServiceCard
                          service={service}
                          provider={agentMap.get(service.providerId)}
                          onSelect={setSelectedService}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Agents */}
          <TabsContent value="agents" className="mt-0">
            {selectedAgent ? (
              <AgentDetail
                agent={selectedAgent}
                onBack={() => setSelectedAgent(null)}
              />
            ) : (
              <AgentTable agents={agents} onSelect={setSelectedAgent} />
            )}
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="mt-0">
            {selectedTx ? (
              <TransactionDetail
                transaction={selectedTx}
                agents={agents}
                escrow={escrows.find((e) => e.transactionId === selectedTx.id)}
                onBack={() => setSelectedTx(null)}
              />
            ) : (
              <TransactionList
                transactions={transactions}
                agents={agents}
                onSelect={setSelectedTx}
              />
            )}
          </TabsContent>

          {/* Negotiations */}
          <TabsContent value="negotiations" className="mt-0">
            <NegotiationPanel
              negotiations={negotiations}
              agents={agents}
              services={services}
            />
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes" className="mt-0">
            <DisputeList disputes={disputes} agents={agents} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>AgentExchange Protocol v0.1.0</span>
          <span>Agent-to-Agent Services Marketplace</span>
        </div>
      </footer>
    </div>
  );
}
