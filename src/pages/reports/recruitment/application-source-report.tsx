import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Button, Spin, message, Tag, Progress, Row, Col, Statistic, Divider } from 'antd';
import { Pie, Bar } from '@ant-design/charts';
import axios from 'axios';
import moment from 'moment';
import { baseURL } from '../../../utils/api';
import { CheckCircleOutlined, GlobalOutlined, LinkedinOutlined, MailOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const sourceIcons = {
  'Website': <GlobalOutlined />,
  'LinkedIn': <LinkedinOutlined />,
  'Email': <MailOutlined />,
  'Referral': <TeamOutlined />,
  'Other': <UserAddOutlined />
};

const sourceColors = {
  'Website': '#1890ff',
  'LinkedIn': '#0e76a8',
  'Email': '#ff4d4f',
  'Referral': '#52c41a',
  'Other': '#faad14'
};

const ApplicationSourceReport = () => {
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: '2025-03-01',
    to_date: '2025-08-01'
  });

  const fetchSourceData = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      const token = JSON.parse(user).token.access_token;

      const params = new URLSearchParams();
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);

      const response = await axios.get(`${baseURL}/reports/recruitments/application-source?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSourceData(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch source data');
      }
    } catch (error) {
      console.error(error);
      message.error('Error fetching application sources');
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

  // Calculate summary statistics
  const getSummaryStats = () => {
    return sourceData.reduce((stats, item) => {
      stats.totalApplications += item.total;
      stats.totalInterviews += item.interviews_count;
      stats.totalOffers += item.offers_count;
      stats.totalHires += item.hires_count;
      return stats;
    }, {
      totalApplications: 0,
      totalInterviews: 0,
      totalOffers: 0,
      totalHires: 0
    });
  };

  const summaryStats = getSummaryStats();

  // Data for pie chart (applications by source)
  const getPieChartData = () => {
    return sourceData.map(item => ({
      type: item.source,
      value: item.total,
      color: sourceColors[item.source] || '#8884d8'
    }));
  };

  // Data for bar chart (conversion funnel by source)
  const getBarChartData = () => {
    return sourceData.map(item => ({
      source: item.source,
      Applications: item.total,
      Interviews: item.interviews_count,
      Offers: item.offers_count,
      Hires: item.hires_count
    }));
  };

  const columns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 150,
      fixed: 'left',
      render: (source) => (
        <div className="flex items-center gap-2">
          {sourceIcons[source] || <UserAddOutlined />}
          <span>{source}</span>
        </div>
      ),
      sorter: (a, b) => a.source.localeCompare(b.source),
    },
    {
      title: 'Applications',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total, record) => (
        <div>
          <div className="font-bold">{total}</div>
          <Progress 
            percent={(total / summaryStats.totalApplications) * 100} 
            size="small" 
            strokeColor={sourceColors[record.source]}
            showInfo={false}
          />
        </div>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Interviews',
      dataIndex: 'interviews_count',
      key: 'interviews',
      width: 120,
      render: (count, record) => (
        <div>
          <div className="font-bold">{count}</div>
          <div className="text-xs text-gray-500">
            {record.total > 0 ? `${Math.round((count / record.total) * 100)}%` : '0%'} conversion
          </div>
        </div>
      ),
      sorter: (a, b) => a.interviews_count - b.interviews_count,
    },
    {
      title: 'Offers',
      dataIndex: 'offers_count',
      key: 'offers',
      width: 120,
      render: (count, record) => (
        <div>
          <div className="font-bold">{count}</div>
          <div className="text-xs text-gray-500">
            {record.interviews_count > 0 ? `${Math.round((count / record.interviews_count) * 100)}%` : '0%'} conversion
          </div>
        </div>
      ),
      sorter: (a, b) => a.offers_count - b.offers_count,
    },
    {
      title: 'Hires',
      dataIndex: 'hires_count',
      key: 'hires',
      width: 120,
      render: (count, record) => (
        <div>
          <div className="font-bold">{count}</div>
          <div className="text-xs text-gray-500">
            {record.offers_count > 0 ? `${Math.round((count / record.offers_count) * 100)}%` : '0%'} acceptance
          </div>
        </div>
      ),
      sorter: (a, b) => a.hires_count - b.hires_count,
    },
    {
      title: 'Conversion Rate',
      key: 'conversion',
      render: (_, record) => (
        <div className="text-center">
          <div className="font-bold">
            {record.total > 0 ? `${Math.round((record.hires_count / record.total) * 100)}%` : '0%'}
          </div>
          <Tag color={record.hires_count > 0 ? 'green' : 'default'}>
            {record.hires_count} hire{record.hires_count !== 1 ? 's' : ''}
          </Tag>
        </div>
      ),
      sorter: (a, b) => (a.hires_count / a.total) - (b.hires_count / b.total),
    },
  ];

  const pieConfig = {
    data: getPieChartData(),
    angleField: 'value',
    colorField: 'type',
    color: ({ type }) => sourceColors[type] || '#8884d8',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}\n{percentage}',
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    height: 300,
    legend: {
      position: 'bottom',
    },
  };

  const barConfig = {
    data: getBarChartData(),
    isStack: true,
    xField: 'source',
    yField: 'value',
    seriesField: 'type',
    height: 300,
    legend: {
      position: 'bottom',
    },
    meta: {
      source: { alias: 'Source' },
      value: { alias: 'Count' },
    },
    tooltip: {
      shared: true,
      showMarkers: false,
    },
  };

  return (
    <div className="p-6">
      <Card
        title="Application Source Report"
        bordered={false}
        extra={
          <Button type="primary" onClick={fetchSourceData} loading={loading}>
            Refresh
          </Button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <RangePicker
              defaultValue={[moment(filters.from_date), moment(filters.to_date)]}
              onChange={handleDateChange}
              style={{ width: 250 }}
            />
          </div>
        </div>

        {/* Summary Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={24} md={6}>
            <Card>
              <Statistic
                title="Total Applications"
                value={summaryStats.totalApplications}
                prefix={<UserAddOutlined />}
              />
            </Card>
          </Col>
          <Col span={24} md={6}>
            <Card>
              <Statistic
                title="Total Interviews"
                value={summaryStats.totalInterviews}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={24} md={6}>
            <Card>
              <Statistic
                title="Total Offers"
                value={summaryStats.totalOffers}
                prefix={<MailOutlined />}
              />
            </Card>
          </Col>
          <Col span={24} md={6}>
            <Card>
              <Statistic
                title="Total Hires"
                value={summaryStats.totalHires}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Source Distribution</Divider>

        <Row gutter={16} className="mb-6">
          <Col span={24} md={12}>
            <Card title="Applications by Source">
              <Pie {...pieConfig} />
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card title="Conversion Funnel by Source">
              <Bar 
                {...barConfig}
                data={getBarChartData().flatMap(item => [
                  { source: item.source, type: 'Applications', value: item.Applications },
                  { source: item.source, type: 'Interviews', value: item.Interviews },
                  { source: item.source, type: 'Offers', value: item.Offers },
                  { source: item.source, type: 'Hires', value: item.Hires },
                ])}
                isStack={false}
                seriesField="type"
                color={({ type }) => {
                  switch(type) {
                    case 'Applications': return '#1890ff';
                    case 'Interviews': return '#722ed1';
                    case 'Offers': return '#faad14';
                    case 'Hires': return '#52c41a';
                    default: return '#8884d8';
                  }
                }}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Detailed Source Metrics</Divider>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={sourceData}
            rowKey="source"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <span className="font-medium">Totals</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span className="font-medium">{summaryStats.totalApplications}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <span className="font-medium">{summaryStats.totalInterviews}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <span className="font-medium">{summaryStats.totalOffers}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <span className="font-medium">{summaryStats.totalHires}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <span className="font-medium">
                      {summaryStats.totalApplications > 0 
                        ? `${Math.round((summaryStats.totalHires / summaryStats.totalApplications) * 100)}%` 
                        : '0%'}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ApplicationSourceReport;