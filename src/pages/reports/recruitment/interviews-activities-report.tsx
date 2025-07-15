import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Button, Spin, message, Tag, Progress, Collapse, Statistic, Row, Col, Divider } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { baseURL } from '../../../utils/api';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const statusColors = {
  'scheduled': 'blue',
  'completed': 'green',
  'cancelled': 'red',
  'no_show': 'orange',
  'rescheduled': 'purple'
};

const statusIcons = {
  'scheduled': <ClockCircleOutlined />,
  'completed': <CheckCircleOutlined />,
  'cancelled': <CloseCircleOutlined />,
  'no_show': <CloseCircleOutlined />,
  'rescheduled': <CalendarOutlined />
};

const InterviewActivitiesReport = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: '2025-03-01',
    to_date: '2025-08-01',
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      const token = JSON.parse(user).token.access_token;

      const params = new URLSearchParams();
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);

      const response = await axios.get(`${baseURL}/reports/recruitments/interview-activities?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error(error);
      message.error('Error fetching interview activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates?.length === 2) {
      setFilters({
        ...filters,
        from_date: dates[0].format('YYYY-MM-DD'),
        to_date: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const stats = {
      totalInterviewers: 0,
      totalInterviews: 0,
      statusCounts: {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        rescheduled: 0
      }
    };

    Object.values(reportData).forEach(interviewerActivities => {
      stats.totalInterviewers++;
      interviewerActivities.forEach(activity => {
        stats.totalInterviews += activity.total;
        if (stats.statusCounts.hasOwnProperty(activity.status)) {
          stats.statusCounts[activity.status] += activity.total;
        }
      });
    });

    return stats;
  };

  const summaryStats = getSummaryStats();

  // Flatten data for the detailed table
  const getFlattenedData = () => {
    const result = [];
    Object.entries(reportData).forEach(([interviewerId, activities]) => {
      activities.forEach(activity => {
        result.push({
          key: `${interviewerId}-${activity.status}`,
          ...activity
        });
      });
    });
    return result;
  };

  const columns = [
    {
      title: 'Interviewer',
      key: 'interviewer',
      width: 200,
      fixed: 'left',
      render: (_, record) => {
        const { first_name, last_name, email, employee_code, designation_id } = record.interviewer || {};
        return (
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <UserOutlined className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{`${first_name} ${last_name}`}</div>
              <div className="text-xs text-gray-500">
                {employee_code} • {email}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a, b) => `${a.interviewer.first_name} ${a.interviewer.last_name}`.localeCompare(`${b.interviewer.first_name} ${b.interviewer.last_name}`),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag 
          icon={statusIcons[status] || null} 
          color={statusColors[status] || 'default'}
          className="flex items-center gap-1"
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: Object.keys(statusColors).map(status => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Interviews',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'center',
      render: (total) => <span className="font-bold">{total}</span>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => {
        const interviewer = record.interviewer || {};
        return (
          <div className="text-xs text-gray-500">
            <div>Employee Code: {interviewer.employee_code}</div>
            <div>Phone: {interviewer.phone}</div>
            <div>Gender: {interviewer.gender}</div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Interview Activities Report"
        bordered={false}
        extra={
          <Button type="primary" onClick={fetchActivities} loading={loading}>
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
                title="Total Interviewers"
                value={summaryStats.totalInterviewers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={24} md={6}>
            <Card>
              <Statistic
                title="Total Interviews"
                value={summaryStats.totalInterviews}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          {Object.entries(summaryStats.statusCounts).map(([status, count]) => (
            <Col span={24} md={4} key={status}>
              <Card>
                <Statistic
                  title={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={count}
                  prefix={statusIcons[status]}
                  valueStyle={{ color: statusColors[status] }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Divider orientation="left">Interview Activity Breakdown</Divider>

        <Spin spinning={loading}>
          <Collapse ghost className="mb-6">
            {Object.entries(reportData).map(([interviewerId, activities]) => {
              const interviewer = activities[0]?.interviewer;
              const totalInterviews = activities.reduce((sum, activity) => sum + activity.total, 0);

              return (
                <Panel 
                  header={
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{interviewer?.first_name} {interviewer?.last_name}</span>
                        <span className="text-gray-500 ml-2">({interviewer?.employee_code})</span>
                      </div>
                      <div>
                        <Tag color="blue">{totalInterviews} interviews</Tag>
                      </div>
                    </div>
                  } 
                  key={interviewerId}
                >
                  <Table
                    columns={columns.filter(col => col.key !== 'interviewer')}
                    dataSource={activities}
                    rowKey={(record) => record.status}
                    pagination={false}
                    size="small"
                  />
                </Panel>
              );
            })}
          </Collapse>

          <Card title="Detailed View" className="mt-6">
            <Table
              columns={columns}
              dataSource={getFlattenedData()}
              rowKey="key"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <span className="font-medium">Total Across All Interviewers:</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <span className="font-medium">{summaryStats.totalInterviews}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Spin>
      </Card>
    </div>
  );
};

export default InterviewActivitiesReport;