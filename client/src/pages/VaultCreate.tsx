import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function VaultCreate() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    riskLevel: "moderate" as const,
    investmentGoal: "yield" as const,
    initialDepositUSD: "",
  });

  const createVaultMutation = trpc.vault.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a vault name");
      return;
    }

    if (!formData.initialDepositUSD || parseFloat(formData.initialDepositUSD) <= 0) {
      toast.error("Please enter a valid initial deposit");
      return;
    }

    try {
      const result = await createVaultMutation.mutateAsync(formData);
      toast.success("Vault created successfully!");
      setLocation(`/vaults/${result.vaultId}`);
    } catch (error) {
      toast.error("Failed to create vault");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Vault</CardTitle>
            <CardDescription>Set up your AI-optimized yield vault on Mantle Network</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vault Name */}
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Vault Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Conservative Yield Vault"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your vault's purpose and strategy"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Initial Deposit */}
              <div>
                <Label htmlFor="deposit" className="text-base font-semibold">
                  Initial Deposit (USD)
                </Label>
                <Input
                  id="deposit"
                  type="number"
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  value={formData.initialDepositUSD}
                  onChange={e => setFormData({ ...formData, initialDepositUSD: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum recommended: $100</p>
              </div>

              {/* Risk Level */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Risk Level</Label>
                <RadioGroup value={formData.riskLevel} onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="conservative" id="conservative" />
                      <Label htmlFor="conservative" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Conservative</div>
                        <div className="text-xs text-slate-500">60% stable, 30% moderate, 10% growth - Low volatility</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Moderate</div>
                        <div className="text-xs text-slate-500">40% stable, 40% moderate, 20% growth - Balanced risk</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="aggressive" id="aggressive" />
                      <Label htmlFor="aggressive" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Aggressive</div>
                        <div className="text-xs text-slate-500">20% stable, 40% moderate, 40% growth - Higher returns</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Investment Goal */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Investment Goal</Label>
                <RadioGroup value={formData.investmentGoal} onValueChange={(value: any) => setFormData({ ...formData, investmentGoal: value })}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="yield" id="yield" />
                      <Label htmlFor="yield" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Maximize Yield</div>
                        <div className="text-xs text-slate-500">Focus on APY and passive income generation</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="growth" id="growth" />
                      <Label htmlFor="growth" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Capital Growth</div>
                        <div className="text-xs text-slate-500">Prioritize long-term value appreciation</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="stability" id="stability" />
                      <Label htmlFor="stability" className="flex-1 cursor-pointer font-normal">
                        <div className="font-semibold text-slate-900">Stability</div>
                        <div className="text-xs text-slate-500">Minimize volatility and preserve capital</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createVaultMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {createVaultMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Vault"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
