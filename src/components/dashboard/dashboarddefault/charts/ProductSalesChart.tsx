import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useKeycloak } from "@react-keycloak/web"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { YearMonthCurrencySelect } from "./YearMonthCurrencySelect"
import { NoDataDisplay } from "./NoDataDisplay"
import { useTranslation } from "react-i18next"
import { TFunction } from "i18next"

interface ChartDataItem {
  year: number
  month: number
  dayOfMonth: number
  quantity: number
  amount: number
  currency: string
}

interface ApiResponse {
  success: boolean
  message: string
  code: number
  data: ChartDataItem[]
}

const getChartConfig = (t: TFunction): ChartConfig => ({
  quantity: {
    label: t('productSales.quantity'),
    color: "hsl(var(--chart-1))",
  },
  amount: {
    label: t('productSales.amount'),
    color: "hsl(var(--chart-2))",
  },
})

const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GEL: "₾"
}

const getLocale = (lang: string): string => {
  switch (lang) {
    case 'es':
      return 'es-ES'
    case 'ka':
      return 'ka-GE'
    default:
      return 'en-US'
  }
}

const ProductSalesChart: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = React.useState(currentYear)
  const [month, setMonth] = React.useState(new Date().getMonth() + 1)
  const [currency, setCurrency] = React.useState("USD")
  const [, setChartData] = React.useState<ChartDataItem[]>([])
  const [displayedData, setDisplayedData] = React.useState<ChartDataItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { keycloak, initialized } = useKeycloak()
  const { t, i18n } = useTranslation('charts')

  const chartConfig = React.useMemo(() => getChartConfig(t), [t])
  const locale = React.useMemo(() => getLocale(i18n.language), [i18n.language])

  const fetchData = async (year: number, month: number, currency: string) => {
    if (!initialized || !keycloak.authenticated) {
      return null
    }
    const response = await fetch(
      `https://api.invoicehub.space/api/v1/dashboard/soldProductsBy/${year}/${month}/${currency}`,
      {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result: ApiResponse = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch data')
    }
    return result.data
  }

  React.useEffect(() => {
    const loadData = async () => {
      if (!initialized || !keycloak.authenticated) {
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchData(year, month, currency)
        if (data && data.length > 0) {
          setChartData(data)
          setDisplayedData(data)
        } else {
          setError(`No data available`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [initialized, keycloak.authenticated, year, month, currency])

  const formattedChartData = displayedData.map(item => ({
    date: `${item.year}-${item.month.toString().padStart(2, '0')}-${item.dayOfMonth.toString().padStart(2, '0')}`,
    quantity: item.quantity,
    amount: item.amount
  }))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    })
  }

  if (!initialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p>{t('productSales.initializing')}</p>
        </CardContent>
      </Card>
    )
  }

  if (!keycloak.authenticated) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p>{t('productSales.authentication')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 space-y-0 border-b py-5">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{t('productSales.title')}</CardTitle>
          <CardDescription>{t('productSales.titleAbout')}</CardDescription>
        </div>
        <YearMonthCurrencySelect
          year={year}
          month={month}
          currency={currency}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onCurrencyChange={setCurrency}
        />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p>{t('productSales.loadingData')}</p>
          </div>
        ) : error ? (
          <NoDataDisplay />
        ) : formattedChartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={formattedChartData}>
              <defs>
                <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-quantity)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-quantity)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-amount)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-amount)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDate}
                    formatter={(value, name) => {
                      if (name === 'amount') {
                        return [`${currencySymbols[currency]}${value}`, chartConfig.amount.label]
                      }
                      return [value, name === 'quantity' ? chartConfig.quantity.label : name]
                    }}
                  />
                }
              />
              <Area
                dataKey="quantity"
                type="natural"
                fill="url(#fillQuantity)"
                stroke="var(--color-quantity)"
                stackId="a"
              />
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillAmount)"
                stroke="var(--color-amount)"
                stackId="a"
              />
              <ChartLegend 
                content={<ChartLegendContent />} 
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ProductSalesChart

