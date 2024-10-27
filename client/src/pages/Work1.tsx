import React, { useState, useEffect } from "react"
import { Flipside } from "@flipsidecrypto/sdk"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

interface NftPlatformRecord {
  platform_name: string
  sales_count: number
}

interface PriceRecord {
  hour: string
  price: number
}

interface BridgeRecord {
  platform: string
  block_count: number
}

const NftPlatforms: React.FC = () => {
  const [nftData, setNftData] = useState<NftPlatformRecord[]>([])
  const [priceData, setPriceData] = useState<PriceRecord[]>([])
  const [bridgeData, setBridgeData] = useState<BridgeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const flipside = new Flipside(
          "0964614b-b72f-4092-a9e3-04b747cdb143",
          "https://api-v2.flipsidecrypto.xyz",
        )

        // Query for NFT platform sales data
        const nftSql = `
          SELECT platform_name, count(*) as sales_count
          FROM ethereum.nft.ez_nft_sales
          WHERE block_timestamp > current_date - interval '30 days'
          GROUP BY platform_name
          ORDER BY sales_count DESC
          LIMIT 8
        `
        const nftResult = await flipside.query.run({ sql: nftSql })
        if (nftResult.error) throw new Error(nftResult.error.message)

        const nftRecords = (nftResult.records ?? [])
          .map((record) => ({
            platform_name:
              typeof record.platform_name === "string"
                ? record.platform_name
                : "",
            sales_count:
              typeof record.sales_count === "number" ? record.sales_count : 0,
          }))
          .filter(
            (record): record is NftPlatformRecord =>
              record.platform_name !== "" && record.sales_count > 0,
          )

        setNftData(nftRecords)

        // Query for Ethereum hourly price data
        const priceSql = `
          SELECT hour, price 
          FROM ethereum.price.ez_prices_hourly 
          WHERE name='ethereum'
          ORDER BY hour DESC
          LIMIT 50 OFFSET 50;
        `

        const priceResult = await flipside.query.run({ sql: priceSql })
        if (priceResult.error) throw new Error(priceResult.error.message)

        const priceRecords = (priceResult.records ?? [])
          .map((record) => ({
            hour: typeof record.hour === "string" ? record.hour : "",
            price: typeof record.price === "number" ? record.price : 0,
          }))
          .filter(
            (record): record is PriceRecord =>
              record.hour !== "" && record.price > 0,
          )

        setPriceData(priceRecords)

        // Query for DeFi bridge activity data
        const bridgeSql = `
          SELECT COUNT(BLOCK_NUMBER) as block_count, platform
          FROM ethereum.defi.ez_bridge_activity
          GROUP BY platform
          ORDER BY COUNT(BLOCK_NUMBER) DESC
          LIMIT 10
        `
        const bridgeResult = await flipside.query.run({ sql: bridgeSql })
        if (bridgeResult.error) throw new Error(bridgeResult.error.message)

        const bridgeRecords = (bridgeResult.records ?? [])
          .map((record) => ({
            platform:
              typeof record.platform === "string" ? record.platform : "",
            block_count:
              typeof record.block_count === "number" ? record.block_count : 0,
          }))
          .filter(
            (record): record is BridgeRecord =>
              record.platform !== "" && record.block_count > 0,
          )

        setBridgeData(bridgeRecords)

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // NFT Platforms chart configuration (Bar Chart)
  const nftChartData = {
    labels: nftData.map((record) => record.platform_name),
    datasets: [
      {
        label: "Sales Count",
        data: nftData.map((record) => record.sales_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Ethereum Prices chart configuration (Line Chart)
  const priceChartData = {
    labels: priceData.map((record) => new Date(record.hour).toLocaleString()), // Format the hour for display
    datasets: [
      {
        label: "Price (in Dollars)",
        data: priceData.map((record) =>
          Number(record.price.toString().slice(0, 5)),
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        fill: false, // Make it a line chart
      },
    ],
  }

  // DeFi Bridge chart configuration (Bar Chart)
  const bridgeChartData = {
    labels: bridgeData.map((record) => record.platform),
    datasets: [
      {
        label: "Block Count",
        data: bridgeData.map((record) => record.block_count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  return (
    <div className="mt-20">
      {/* <h2 style={{ textAlign: "center" }}>Ethereum Hourly Prices</h2> */}
      <div
        style={{
          width: "100%",
          marginTop: "80px", // Add top margin here
          padding: "2px",
          height: "400px",
          margin: "auto",
          border: "2px solid white", // White border
          borderRadius: "8px",
          
        }}
      >
        <Line
          data={priceChartData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Ethereum Prices" },
            },
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "40vh",
            padding: "20px 8px",
            border: "2px solid white",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>
            Top 8 NFT Platforms by Sales (Last 30 Days)
          </h2>
          <Bar
            data={nftChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: "NFT Platform Sales Count" },
              },
            }}
          />
        </div>
        <div
          style={{
            width: "50%",
            height: "40vh",
            padding: "20px 8px",
            border: "2px solid white",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>
            Top 10 DeFi Platforms by Bridge Activity
          </h2>
          <Bar
            data={bridgeChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: "DeFi Bridge Block Count" },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default NftPlatforms