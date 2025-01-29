import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentScans() {
  const recentScans = [
    { id: 1, type: "URL", target: "https://example.com", result: "Clean", date: "2025-01-28" },
    { id: 2, type: "File", target: "document.pdf", result: "Suspicious", date: "2025-01-27" },
    { id: 3, type: "CVE", target: "CVE-2025-1234", result: "Found", date: "2025-01-26" },
    { id: 4, type: "URL", target: "https://test.com", result: "Malicious", date: "2025-01-25" },
    { id: 5, type: "File", target: "app.exe", result: "Clean", date: "2025-01-24" },
  ]

  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Recent Scans
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-blue-600 dark:text-blue-400">Type</TableHead>
                <TableHead className="text-blue-600 dark:text-blue-400">Target</TableHead>
                <TableHead className="text-blue-600 dark:text-blue-400">Result</TableHead>
                <TableHead className="text-blue-600 dark:text-blue-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScans.map((scan) => (
                <TableRow
                  key={scan.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell className="text-gray-900 dark:text-gray-100">{scan.type}</TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">{scan.target}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        scan.result === "Clean"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : scan.result === "Suspicious"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {scan.result}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-gray-100">{scan.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}

