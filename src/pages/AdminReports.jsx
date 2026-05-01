import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Button from '../components/Button'
import '../styles/dashboard.css'
import {
  BarChart3,
  Download,
  Calendar,
  FileText
} from 'lucide-react'

export default function AdminReports(){
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header title="Reports & Analytics" />

        <main className="dash-main">
          <div className="dash-head">
            <h1 className="page-title">Reports & Analytics</h1>

            <div className="dash-actions">
              <Button variant="secondary">
                <Download size={16} strokeWidth={2} />
                Export Report
              </Button>
            </div>
          </div>

          <section className="stat-grid reports-stat-grid">
            <div className="stat-tile">
              <div className="stat-top">
                <div className="stat-icon">
                  <BarChart3 size={18} strokeWidth={2} />
                </div>
                <div className="stat-label">Total Complaints (This Month)</div>
              </div>
              <div className="stat-value">128</div>
            </div>

            <div className="stat-tile">
              <div className="stat-top">
                <div className="stat-icon">
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div className="stat-label">Document Requests (This Month)</div>
              </div>
              <div className="stat-value">74</div>
            </div>

            <div className="stat-tile">
              <div className="stat-top">
                <div className="stat-icon">
                  <Calendar size={18} strokeWidth={2} />
                </div>
                <div className="stat-label">Avg. Resolution Time</div>
              </div>
              <div className="stat-value">3.2 Days</div>
            </div>
          </section>

          <section className="dashboard-panel reports-panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Monthly Summary</h2>
                <p className="panel-sub">
                  Overview of complaints and document requests by month.
                </p>
              </div>
            </div>

            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Complaints</th>
                    <th>Resolved</th>
                    <th>Total Requests</th>
                    <th>Released</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>January</td>
                    <td>112</td>
                    <td>96</td>
                    <td>68</td>
                    <td>60</td>
                  </tr>
                  <tr>
                    <td>February</td>
                    <td>128</td>
                    <td>102</td>
                    <td>74</td>
                    <td>70</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-panel reports-panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Charts</h2>
                <p className="panel-sub">
                  Visual analytics will be displayed here.
                </p>
              </div>
            </div>

            <div className="reports-empty">
              📊 Charts and visual analytics coming soon.
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}