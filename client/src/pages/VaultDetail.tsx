import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function VaultDetail() {
  const { vaultId: vaultIdStr } = useParams<{ vaultId: string }>();
  const [, setLocation] = useLocation();
  const vaultId = parseInt(vaultIdStr || "0");

  const { data: vault, isLoading: vaultLoading } = trpc.vault.getById.useQuery({ vaultId });
  const { data: allocations } = trpc.allocation.getByVault.useQuery({ vaultId });
  const { data: performanceHistory } = trpc.performance.getHistory.useQuery({ vaultId });
  const { data: recommendations } = trpc.rebalancing.getRecommendations.useQuery({ vaultId });

  const compareYieldsMutation = trpc.ai.compareYields.useQuery();
  const acceptRecommendationMutation = trpc.rebalancing.acceptRecommendation.useMutation();

  if (vaultLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-600 mb-4">Vault not found</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const chartData = allocations?.map(a => ({
    name: a.protocol.replace('_', ' ').toUpperCase(),
    value: parseFloat(a.percentageAllocation.toString()),
    apy: parseFloat(a.currentAPY.toString()),
  })) || [];

  const performanceData = performanceHistory?.map(h => ({
    date: new Date(h.snapshotDate).toLocaleDateString(),
    value: parseFloat(h.totalValueUSD.toString()),
    returns: parseFloat(h.totalReturnsPercent.toString()),
  })) || [];

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6'];

  const handleAcceptRecommendation = async (recommendationId: number) => {
    try {
      await acceptRecommendationMutation.mutateAsync({
        recommendationId,
        transactionHash: "0x" + Math.random().toString(16).slice(2),
      });
      toast.success("Recommendation accepted!");
    } catch (error) {
      toast.error("Failed to accept recommendation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Vault Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{vault.name}</h1>
          <p className="text-slate-600">{vault.description}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${vault.totalValueUSD}</div>
              <p className="text-xs text-slate-500 mt-1">USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${vault.totalReturnsUSD}</div>
              <p className="text-xs text-slate-500 mt-1">{vault.totalReturnsPercent}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-slate-900">{vault.riskLevel}</div>
              <p className="text-xs text-slate-500 mt-1">Profile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-slate-900">{vault.status}</div>
              <p className="text-xs text-slate-500 mt-1">Vault state</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="allocation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="yields">Yields</TabsTrigger>
            <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
          </TabsList>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Allocation</CardTitle>
                <CardDescription>Distribution across Mantle protocols</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie data={chartData} cx="50%" cy="50%" outerRadius={80}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                      {chartData.map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                            <span className="font-semibold text-slate-900">{item.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Allocation:</span>
                            <span className="font-semibold text-slate-900">{item.value}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Current APY:</span>
                            <span className="font-semibold text-green-600">{item.apy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No allocation data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>Vault value over time</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#06b6d4" name="Vault Value ($)" />
                      <Line type="monotone" dataKey="returns" stroke="#10b981" name="Returns (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-600 text-center py-8">No performance data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yields Tab */}
          <TabsContent value="yields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Protocol Yield Comparison</CardTitle>
                <CardDescription>Current APY rates across Mantle protocols</CardDescription>
              </CardHeader>
              <CardContent>
                {compareYieldsMutation.data ? (
                  <div className="space-y-4">
                    {compareYieldsMutation.data.protocols.map((protocol, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">{protocol.poolName}</h3>
                          <span className="text-lg font-bold text-green-600">{protocol.currentAPY}% APY</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{protocol.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">TVL:</span>
                            <p className="font-semibold text-slate-900">${protocol.tvl}M</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Daily Volume:</span>
                            <p className="font-semibold text-slate-900">${protocol.dailyVolume}M</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Risk:</span>
                            <p className="font-semibold capitalize text-slate-900">{protocol.riskLevel}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">Loading yield data...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rebalancing Tab */}
          <TabsContent value="rebalancing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Rebalancing Recommendations</CardTitle>
                <CardDescription>Smart allocation suggestions based on market sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map(rec => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 capitalize">{rec.status}</h3>
                            <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                          </div>
                          <span className="text-lg font-bold text-green-600">+{rec.projectedAPY}% APY</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-slate-600">Return Increase:</span>
                            <p className="font-semibold text-slate-900">{rec.projectedReturnIncrease}%</p>
                          </div>
                          <div>\n                            <span className="text-slate-600">Risk Score:</span>\n                            <p className="font-semibold text-slate-900">{(parseFloat(rec.riskScore.toString()) * 100).toFixed(0)}%</p>                         </div>
                          <div>
                            <span className="text-slate-600">Created:</span>
                            <p className="font-semibold text-slate-900">{new Date(rec.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {rec.status === 'pending' && (
                          <Button
                            onClick={() => handleAcceptRecommendation(rec.id)}
                            disabled={acceptRecommendationMutation.isPending}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                          >
                            {acceptRecommendationMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              "Execute Rebalancing"
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">No recommendations yet. Check back soon!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
