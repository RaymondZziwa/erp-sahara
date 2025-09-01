import { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Spin, message, Row, Col, Statistic, Progress, Tag } from 'antd';
import { ClockCircleOutlined, TeamOutlined, MailOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { baseURL } from '../../../utils/api';

const { RangePicker } = DatePicker;

const RecruitmentSummaryDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: '2025-03-01',
    to_date: '2025-08-01'
  });

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      const token = JSON.parse(user).token.access_token;

      const params = new URLSearchParams();
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);

      const response = await axios.get(`${baseURL}/reports/recruitments/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error(error);
      message.error('Error fetching recruitment summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates?.length === 2) {
      setFilters({
        ...filters,
        from_date: dates[0].format('YYYY-MM-DD'),
        to_date: dates[1].format('YYYY-MM-DD')
      });
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  return (
    <div className="p-6">
      <Card
        title="Recruitment Summary Dashboard"
        bordered={false}
        extra={
          <div className="flex flex-wrap gap-4">
            <RangePicker
              defaultValue={[moment(filters.from_date), moment(filters.to_date)]}
              onChange={handleDateChange}
              style={{ width: 250 }}
            />
            <Button type="primary" onClick={fetchMetrics} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          {metrics && (
            <>
              {/* Key Metrics */}
              <Row gutter={16} className="mb-6">
                <Col span={24} md={6}>
                  <Card>
                    <Statistic
                      title="Total Applications"
                      value={metrics.total_applications}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <div className="mt-2">
                      <Tag icon={<GlobalOutlined />} color="blue">
                        Top Source: {metrics.top_source} ({metrics.top_source_count})
                      </Tag>
                    </div>
                  </Card>
                </Col>
                <Col span={24} md={6}>
                  <Card>
                    <Statistic
                      title="Interviews Scheduled"
                      value={metrics.interviews_scheduled}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                    <Progress
                      percent={metrics.total_applications > 0 
                        ? (metrics.interviews_scheduled / metrics.total_applications) * 100 
                        : 0}
                      status="active"
                      strokeColor="#722ed1"
                      showInfo={false}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {metrics.total_applications > 0 
                        ? `${Math.round((metrics.interviews_scheduled / metrics.total_applications) * 100)}% of applications` 
                        : 'No applications'}
                    </div>
                  </Card>
                </Col>
                <Col span={24} md={6}>
                  <Card>
                    <Statistic
                      title="Offers Sent"
                      value={metrics.offers_sent}
                      prefix={<MailOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Progress
                      percent={metrics.interviews_scheduled > 0 
                        ? (metrics.offers_sent / metrics.interviews_scheduled) * 100 
                        : 0}
                      status="active"
                      strokeColor="#faad14"
                      showInfo={false}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {metrics.interviews_scheduled > 0 
                        ? `${Math.round((metrics.offers_sent / metrics.interviews_scheduled) * 100)}% of interviews` 
                        : 'No interviews'}
                    </div>
                  </Card>
                </Col>
                <Col span={24} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Time to Hire (days)"
                      value={metrics.average_time_to_hire}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <div className="mt-2">
                      <Tag color={metrics.average_time_to_hire > 0 ? 'green' : 'default'}>
                        {metrics.average_time_to_hire > 0 ? 'Active' : 'No hires yet'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Conversion Funnel */}
              <Card title="Recruitment Funnel" className="mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{metrics.total_applications}</div>
                        <div className="text-sm">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-purple-600">{metrics.interviews_scheduled}</div>
                        <div className="text-sm">Interviews</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-yellow-600">{metrics.offers_sent}</div>
                        <div className="text-sm">Offers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">
                          {metrics.average_time_to_hire > 0 ? 'Hired' : '0'}
                        </div>
                        <div className="text-sm">Hires</div>
                      </div>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-blue-500" 
                        style={{ width: '100%' }}
                      />
                      <div 
                        className="absolute h-full bg-purple-500" 
                        style={{ 
                          width: `${metrics.total_applications > 0 
                            ? (metrics.interviews_scheduled / metrics.total_applications) * 100 
                            : 0}%` 
                        }}
                      />
                      <div 
                        className="absolute h-full bg-yellow-500" 
                        style={{ 
                          width: `${metrics.interviews_scheduled > 0 
                            ? (metrics.offers_sent / metrics.interviews_scheduled) * 100 
                            : 0}%` 
                        }}
                      />
                      <div 
                        className="absolute h-full bg-green-500" 
                        style={{ 
                          width: `${metrics.offers_sent > 0 && metrics.average_time_to_hire > 0 
                            ? 10 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500">
                      <div>
                        {metrics.total_applications > 0 
                          ? `${Math.round((metrics.interviews_scheduled / metrics.total_applications) * 100)}% to interview` 
                          : '0%'}
                      </div>
                      <div>
                        {metrics.interviews_scheduled > 0 
                          ? `${Math.round((metrics.offers_sent / metrics.interviews_scheduled) * 100)}% to offer` 
                          : '0%'}
                      </div>
                      <div>
                        {metrics.offers_sent > 0 && metrics.average_time_to_hire > 0 
                          ? 'Hires made' 
                          : '0% to hire'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Indicators */}
              <Row gutter={16}>
                <Col span={24} md={12}>
                  <Card title="Top Application Source">
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-600 mb-2">
                          {metrics.top_source_count}
                        </div>
                        <Tag icon={<GlobalOutlined />} color="blue" className="text-lg">
                          {metrics.top_source}
                        </Tag>
                        <div className="mt-4 text-gray-500">
                          {metrics.total_applications > 0 
                            ? `${Math.round((metrics.top_source_count / metrics.total_applications) * 100)}% of all applications` 
                            : 'No applications'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={24} md={12}>
                  <Card title="Time to Hire Performance">
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        {metrics.average_time_to_hire > 0 ? (
                          <>
                            <div className="text-5xl font-bold text-green-600 mb-2">
                              {metrics.average_time_to_hire}
                              <span className="text-2xl">days</span>
                            </div>
                            <Tag color="green" className="text-lg">
                              Average Time to Hire
                            </Tag>
                            <div className="mt-4 text-gray-500">
                              From application to offer acceptance
                            </div>
                          </>
                        ) : (
                          <div className="text-lg text-gray-500">
                            No hires completed in this period
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default RecruitmentSummaryDashboard;