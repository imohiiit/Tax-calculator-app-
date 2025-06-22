"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Save, RefreshCw, Info, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserData {
  name: string
  age: number
  profession: string
  basicSalary: number
  hra: number
  rentPaid: number
  otherAllowances: number
  totalAnnualSalary: number
  useDetailedBreakdown: boolean
  taxRegime: "old" | "new"
  city: "metro" | "non-metro"
}

interface TaxCalculation {
  grossSalary: number
  standardDeduction: number
  hraExemption: number
  section80C: number
  otherDeductions: number
  taxableIncome: number
  incomeTax: number
  cess: number
  totalTax: number
  netSalary: number
  effectiveRate: number
}

const professions = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Lawyer",
  "Accountant",
  "Manager",
  "Consultant",
  "Sales Executive",
  "Marketing Professional",
  "Engineer",
  "Banker",
  "Government Employee",
  "Business Owner",
  "Freelancer",
  "Other",
]

export default function TaxCalculator() {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    age: 25,
    profession: "",
    basicSalary: 0,
    hra: 0,
    rentPaid: 0,
    otherAllowances: 0,
    totalAnnualSalary: 0,
    useDetailedBreakdown: false,
    taxRegime: "new",
    city: "metro",
  })

  const [oldRegimeTax, setOldRegimeTax] = useState<TaxCalculation | null>(null)
  const [newRegimeTax, setNewRegimeTax] = useState<TaxCalculation | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("taxCalculatorData")
    if (savedData) {
      setUserData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem("taxCalculatorData", JSON.stringify(userData))
    alert("Data saved successfully!")
  }

  // Clear all data
  const clearData = () => {
    setUserData({
      name: "",
      age: 25,
      profession: "",
      basicSalary: 0,
      hra: 0,
      rentPaid: 0,
      otherAllowances: 0,
      totalAnnualSalary: 0,
      useDetailedBreakdown: false,
      taxRegime: "new",
      city: "metro",
    })
    setOldRegimeTax(null)
    setNewRegimeTax(null)
    setShowComparison(false)
  }

  // Calculate HRA exemption
  const calculateHRAExemption = (basic: number, hra: number, rent: number, city: string): number => {
    if (rent === 0) return 0

    const cityAllowance = city === "metro" ? 0.5 : 0.4
    const exemption1 = hra
    const exemption2 = cityAllowance * basic
    const exemption3 = rent - 0.1 * basic

    return Math.max(0, Math.min(exemption1, exemption2, exemption3))
  }

  // Calculate tax for old regime
  const calculateOldRegimeTax = (income: number, hraExemption: number): TaxCalculation => {
    const standardDeduction = 50000
    const section80C = Math.min(150000, income * 0.1) // Assuming 10% investment in 80C
    const otherDeductions = 25000 // Other deductions like 80D, etc.

    let taxableIncome = income - standardDeduction - hraExemption - section80C - otherDeductions
    taxableIncome = Math.max(0, taxableIncome)

    let tax = 0

    // Old regime tax slabs
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        tax += (taxableIncome - 250000) * 0.05
      } else if (taxableIncome <= 1000000) {
        tax += 250000 * 0.05
        tax += (taxableIncome - 500000) * 0.2
      } else {
        tax += 250000 * 0.05
        tax += 500000 * 0.2
        tax += (taxableIncome - 1000000) * 0.3
      }
    }

    const cess = tax * 0.04 // 4% Health and Education Cess
    const totalTax = tax + cess

    return {
      grossSalary: income,
      standardDeduction,
      hraExemption,
      section80C,
      otherDeductions,
      taxableIncome,
      incomeTax: tax,
      cess,
      totalTax,
      netSalary: income - totalTax,
      effectiveRate: income > 0 ? (totalTax / income) * 100 : 0,
    }
  }

  // Calculate tax for new regime
  const calculateNewRegimeTax = (income: number): TaxCalculation => {
    const standardDeduction = 75000 // Increased in new regime

    let taxableIncome = income - standardDeduction
    taxableIncome = Math.max(0, taxableIncome)

    let tax = 0

    // New regime tax slabs
    if (taxableIncome > 300000) {
      if (taxableIncome <= 700000) {
        tax += (taxableIncome - 300000) * 0.05
      } else if (taxableIncome <= 1000000) {
        tax += 400000 * 0.05
        tax += (taxableIncome - 700000) * 0.1
      } else if (taxableIncome <= 1200000) {
        tax += 400000 * 0.05
        tax += 300000 * 0.1
        tax += (taxableIncome - 1000000) * 0.15
      } else if (taxableIncome <= 1500000) {
        tax += 400000 * 0.05
        tax += 300000 * 0.1
        tax += 200000 * 0.15
        tax += (taxableIncome - 1200000) * 0.2
      } else {
        tax += 400000 * 0.05
        tax += 300000 * 0.1
        tax += 200000 * 0.15
        tax += 300000 * 0.2
        tax += (taxableIncome - 1500000) * 0.3
      }
    }

    const cess = tax * 0.04
    const totalTax = tax + cess

    return {
      grossSalary: income,
      standardDeduction,
      hraExemption: 0,
      section80C: 0,
      otherDeductions: 0,
      taxableIncome,
      incomeTax: tax,
      cess,
      totalTax,
      netSalary: income - totalTax,
      effectiveRate: income > 0 ? (totalTax / income) * 100 : 0,
    }
  }

  // Main calculation function
  const calculateTax = () => {
    let grossSalary = 0

    if (userData.useDetailedBreakdown) {
      grossSalary = userData.basicSalary + userData.hra + userData.otherAllowances
    } else {
      grossSalary = userData.totalAnnualSalary
    }

    if (grossSalary <= 0) {
      alert("Please enter a valid salary amount")
      return
    }

    const hraExemption = userData.useDetailedBreakdown
      ? calculateHRAExemption(userData.basicSalary, userData.hra, userData.rentPaid, userData.city)
      : 0

    const oldTax = calculateOldRegimeTax(grossSalary, hraExemption)
    const newTax = calculateNewRegimeTax(grossSalary)

    setOldRegimeTax(oldTax)
    setNewRegimeTax(newTax)
    setShowComparison(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getBetterRegime = () => {
    if (!oldRegimeTax || !newRegimeTax) return null
    return oldRegimeTax.totalTax < newRegimeTax.totalTax ? "old" : "new"
  }

  const getSavings = () => {
    if (!oldRegimeTax || !newRegimeTax) return 0
    return Math.abs(oldRegimeTax.totalTax - newRegimeTax.totalTax)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🇮🇳 Indian Income Tax Calculator</h1>
            <p className="text-lg text-gray-600">
              Calculate your tax liability for FY 2025-26 under both Old & New Tax Regimes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Calculator Input
                </CardTitle>
                <CardDescription>Enter your details to calculate income tax</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={userData.age}
                        onChange={(e) => setUserData({ ...userData, age: Number.parseInt(e.target.value) || 0 })}
                        placeholder="Enter your age"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    <Select
                      value={userData.profession}
                      onValueChange={(value) => setUserData({ ...userData, profession: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your profession" />
                      </SelectTrigger>
                      <SelectContent>
                        {professions.map((prof) => (
                          <SelectItem key={prof} value={prof}>
                            {prof}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">City Type</Label>
                    <Select
                      value={userData.city}
                      onValueChange={(value: "metro" | "non-metro") => setUserData({ ...userData, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metro">Metro City</SelectItem>
                        <SelectItem value="non-metro">Non-Metro City</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Salary Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Salary Details</h3>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="detailed-breakdown" className="text-sm">
                        Detailed Breakdown
                      </Label>
                      <Switch
                        id="detailed-breakdown"
                        checked={userData.useDetailedBreakdown}
                        onCheckedChange={(checked) => setUserData({ ...userData, useDetailedBreakdown: checked })}
                      />
                    </div>
                  </div>

                  {userData.useDetailedBreakdown ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basic-salary" className="flex items-center gap-2">
                          Basic Salary (Annual)
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Your basic salary component (usually 40-50% of CTC)</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          id="basic-salary"
                          type="number"
                          value={userData.basicSalary}
                          onChange={(e) =>
                            setUserData({ ...userData, basicSalary: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Enter basic salary"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hra" className="flex items-center gap-2">
                          HRA (House Rent Allowance)
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>House Rent Allowance provided by employer</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          id="hra"
                          type="number"
                          value={userData.hra}
                          onChange={(e) => setUserData({ ...userData, hra: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="Enter HRA amount"
                        />
                      </div>

                      <div>
                        <Label htmlFor="rent-paid" className="flex items-center gap-2">
                          Rent Paid (Annual)
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total rent paid during the year</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Input
                          id="rent-paid"
                          type="number"
                          value={userData.rentPaid}
                          onChange={(e) =>
                            setUserData({ ...userData, rentPaid: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Enter annual rent paid"
                        />
                      </div>

                      <div>
                        <Label htmlFor="other-allowances">Other Allowances</Label>
                        <Input
                          id="other-allowances"
                          type="number"
                          value={userData.otherAllowances}
                          onChange={(e) =>
                            setUserData({ ...userData, otherAllowances: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Enter other allowances"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="total-salary">Total Annual Salary</Label>
                      <Input
                        id="total-salary"
                        type="number"
                        value={userData.totalAnnualSalary}
                        onChange={(e) =>
                          setUserData({ ...userData, totalAnnualSalary: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Enter your total annual salary"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={calculateTax} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Tax
                  </Button>
                  <Button onClick={saveData} variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {showComparison && oldRegimeTax && newRegimeTax && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tax Calculation Results</span>
                    <Badge variant={getBetterRegime() === "old" ? "default" : "secondary"}>
                      {getBetterRegime() === "old" ? "Old Regime Better" : "New Regime Better"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Comparison between Old and New Tax Regimes for FY 2025-26</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="comparison" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      <TabsTrigger value="old-regime">Old Regime</TabsTrigger>
                      <TabsTrigger value="new-regime">New Regime</TabsTrigger>
                    </TabsList>

                    <TabsContent value="comparison" className="space-y-4">
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{getBetterRegime() === "old" ? "Old Regime" : "New Regime"}</strong> is better for
                          you! You can save <strong>{formatCurrency(getSavings())}</strong> annually.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-2 border-orange-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-orange-700">Old Regime</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span>Gross Salary:</span>
                              <span className="font-semibold">{formatCurrency(oldRegimeTax.grossSalary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Tax:</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(oldRegimeTax.totalTax)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Salary:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(oldRegimeTax.netSalary)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Effective Rate:</span>
                              <span className="font-semibold">{oldRegimeTax.effectiveRate.toFixed(2)}%</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-blue-700">New Regime</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span>Gross Salary:</span>
                              <span className="font-semibold">{formatCurrency(newRegimeTax.grossSalary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Tax:</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(newRegimeTax.totalTax)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Salary:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(newRegimeTax.netSalary)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Effective Rate:</span>
                              <span className="font-semibold">{newRegimeTax.effectiveRate.toFixed(2)}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="old-regime" className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-700">Old Tax Regime Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gross Salary:</span>
                            <span>{formatCurrency(oldRegimeTax.grossSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Standard Deduction:</span>
                            <span className="text-green-600">-{formatCurrency(oldRegimeTax.standardDeduction)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>HRA Exemption:</span>
                            <span className="text-green-600">-{formatCurrency(oldRegimeTax.hraExemption)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Section 80C:</span>
                            <span className="text-green-600">-{formatCurrency(oldRegimeTax.section80C)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other Deductions:</span>
                            <span className="text-green-600">-{formatCurrency(oldRegimeTax.otherDeductions)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Taxable Income:</span>
                            <span>{formatCurrency(oldRegimeTax.taxableIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Income Tax:</span>
                            <span className="text-red-600">{formatCurrency(oldRegimeTax.incomeTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Health & Education Cess (4%):</span>
                            <span className="text-red-600">{formatCurrency(oldRegimeTax.cess)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Tax:</span>
                            <span className="text-red-600">{formatCurrency(oldRegimeTax.totalTax)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Net Salary:</span>
                            <span className="text-green-600">{formatCurrency(oldRegimeTax.netSalary)}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="new-regime" className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-blue-700">New Tax Regime Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gross Salary:</span>
                            <span>{formatCurrency(newRegimeTax.grossSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Standard Deduction:</span>
                            <span className="text-green-600">-{formatCurrency(newRegimeTax.standardDeduction)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Taxable Income:</span>
                            <span>{formatCurrency(newRegimeTax.taxableIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Income Tax:</span>
                            <span className="text-red-600">{formatCurrency(newRegimeTax.incomeTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Health & Education Cess (4%):</span>
                            <span className="text-red-600">{formatCurrency(newRegimeTax.cess)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Tax:</span>
                            <span className="text-red-600">{formatCurrency(newRegimeTax.totalTax)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Net Salary:</span>
                            <span className="text-green-600">{formatCurrency(newRegimeTax.netSalary)}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tax Saving Tips */}
          {showComparison && (
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tax Saving Tips & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">💡 Smart Tax Saving Tips</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Invest up to ₹1.5L in Section 80C (ELSS, PPF, EPF)</li>
                      <li>• Health insurance premium under Section 80D</li>
                      <li>• Home loan interest deduction under Section 24</li>
                      <li>• NPS investment under Section 80CCD(1B)</li>
                      <li>• Education loan interest under Section 80E</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-700">📊 Regime Selection Guide</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        • <strong>Old Regime:</strong> Better if you have many deductions
                      </li>
                      <li>
                        • <strong>New Regime:</strong> Better for higher income with fewer deductions
                      </li>
                      <li>• Consider your investment pattern and deductions</li>
                      <li>• You can switch regimes annually</li>
                      <li>• Consult a tax advisor for complex cases</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>
              📋 This calculator provides estimates based on current tax laws for FY 2025-26. Please consult a tax
              professional for accurate advice.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
