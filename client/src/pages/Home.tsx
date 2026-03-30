import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Zap, BarChart3, Plus } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: vaults, isLoading: vaultsLoading } = trpc.vault.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Mantle AI Vault</h1>
            <p className="text-lg text-slate-400">AI-Powered DeFi Yield Optimization</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-white">Intelligent Rebalancing</p>
                <p className="text-sm text-slate-400">AI analyzes market sentiment to optimize your allocations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-white">Multi-Protocol Support</p>
                <p className="text-sm text-slate-400">Diversify across Rivera, Merchant Moe, and Agni Finance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-white">Maximize Yields</p>
                <p className="text-sm text-slate-400">Automated yield comparison and portfolio simulation</p>
              </div>
            </div>
          </div>

          <a href={getLoginUrl()}>
            <Button size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              Sign In with Manus
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.name || 'User'}</h1>
          <p className="text-slate-600">Manage your AI-optimized DeFi vaults on Mantle Network</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Vaults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{vaults?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Active vaults</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Average APY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">10.3%</div>
              <p className="text-xs text-slate-500 mt-1">Across all vaults</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">$0</div>
              <p className="text-xs text-slate-500 mt-1">Create a vault to get started</p>
            </CardContent>
          </Card>
        </div>

        {/* Vaults Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Vaults</h2>
            <Button
              onClick={() => setLocation('/vaults/create')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Vault
            </Button>
          </div>

          {vaultsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6 text-slate-400" />
            </div>
          ) : vaults && vaults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vaults.map(vault => (
                <Card
                  key={vault.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/vaults/${vault.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{vault.name}</CardTitle>
                    <CardDescription>{vault.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Risk Level:</span>
                        <span className="text-sm font-semibold capitalize text-slate-900">{vault.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total Value:</span>
                        <span className="text-sm font-semibold text-slate-900">${vault.totalValueUSD}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Returns:</span>
                        <span className="text-sm font-semibold text-green-600">+{vault.totalReturnsPercent}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-slate-500 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto opacity-50 mb-2" />
              </div>
              <p className="text-slate-600 mb-4">No vaults yet. Create one to get started!</p>
              <Button
                onClick={() => setLocation('/vaults/create')}
                variant="outline"
              >
                Create Your First Vault
              </Button>
            </Card>
          )}
        </div>

        {/* AI Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-500" />
                Market Sentiment
              </CardTitle>
              <CardDescription>AI-powered market analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Our LLM analyzes market conditions across Mantle protocols to guide your investment decisions.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/analytics')}>
                View Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Yield Comparison
              </CardTitle>
              <CardDescription>Compare protocol yields</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Compare APY rates across Rivera, Merchant Moe, and Agni Finance in real-time.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/yields')}>
                Compare Yields
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
