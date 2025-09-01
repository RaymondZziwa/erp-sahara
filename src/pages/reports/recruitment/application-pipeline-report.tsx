import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Spin, message, Tag, Progress, Collapse } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { baseURL } from '../../../utils/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

const ApplicationPipelineReport = () => {
  const [pipelineData, setPipelineData] = useState({});
  const [loading, setLoading] = useState(false);
  const [jobOrders, setJobOrders] = useState([]);
  const [filters, setFilters] = useState({
    job_order: 'all',
    from_date: '2025-03-01',
    to_date: '2025-08-01'
  });


  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      
      const user = localStorage.getItem('user');
      const token = JSON.parse(user).token.access_token;
      
      // Construct query parameters
      const params = new URLSearchParams();
      if (filters.job_order !== 'all') {
        params.append('job_order', filters.job_order);
      }
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);
      
      const response = await axios.get(`${baseURL}/reports/recruitments/application-pipeline?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPipelineData(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch pipeline data');
      }
    } catch (error) {
      message.error('Error fetching application pipeline');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobOrders = async () => {
    try {
      const user = localStorage.getItem('user');
      const token = JSON.parse(user).token.access_token;
      
      const response = await axios.get(`${baseURL}/job-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setJobOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching job orders:', error);
    }
  };

  useEffect(() => {
    fetchJobOrders();
    fetchPipelineData();
  }, [filters]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        from_date: dates[0].format('YYYY-MM-DD'),
        to_date: dates[1].format('YYYY-MM-DD')
      });
    }
  };

  const handleJobOrderChange = (value) => {
    setFilters({
      ...filters,
      job_order: value
    });
  };

  const statusColors = {
    'applied': 'blue',
    'screening': 'cyan',
    'interview': 'purple',
    'offer': 'gold',
    'hired': 'green',
    'rejected': 'red'
  };

  // Transform the pipeline data into a flat array for the table
  const getFlattenedData = () => {
    const result = [];
    Object.keys(pipelineData).forEach(jobOrderId => {
      pipelineData[jobOrderId].forEach(item => {
        result.push({
          key: `${jobOrderId}-${item.status}`,
          job_order_id: jobOrderId,
          status: item.status,
          total: item.total,
          job_order: item.job_order
        });
      });
    });
    return result;
  };

  const columns = [
    {
      title: 'Job Order',
      dataIndex: ['job_order', 'title'],
      key: 'job_order',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">
            {record.job_order.job_order_no} · {record.job_order.location_type}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status.toLowerCase()] || 'default'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Applied', value: 'applied' },
        { text: 'Screening', value: 'screening' },
        { text: 'Interview', value: 'interview' },
        { text: 'Offer', value: 'offer' },
        { text: 'Hired', value: 'hired' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value.toLowerCase(),
    },
    {
      title: 'Applications',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <span className="font-bold">{total}</span>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const statusOrder = ['applied', 'screening', 'interview', 'offer', 'hired'];
        const currentIndex = statusOrder.indexOf(record.status.toLowerCase());
        const percent = currentIndex >= 0 ? (currentIndex / (statusOrder.length - 1)) * 100 : 0;
        
        return (
          <Progress 
            percent={percent} 
            size="small" 
            status={record.status === 'rejected' ? 'exception' : 'normal'}
            strokeColor={statusColors[record.status.toLowerCase()]}
          />
        );
      },
    },
  ];

  const getStatusSummary = () => {
    const summary = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
      total: 0
    };

    Object.values(pipelineData).forEach(jobOrderData => {
      jobOrderData.forEach(item => {
        const status = item.status.toLowerCase();
        if (summary.hasOwnProperty(status)) {
          summary[status] += item.total;
          summary.total += item.total;
        }
      });
    });

    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="p-6">
      <Card
        title="Application Pipeline Report"
        bordered={false}
        extra={
          <Button type="primary" onClick={fetchPipelineData} loading={loading}>
            Refresh
          </Button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Order</label>
            <Select
              defaultValue="all"
              style={{ width: 250 }}
              onChange={handleJobOrderChange}
              loading={jobOrders.length === 0}
            >
              <Option value="all">All Job Orders</Option>
              {jobOrders.map(order => (
                <Option key={order.id} value={order.id}>
                  {order.job_order_no} - {order.title}
                </Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <RangePicker
              defaultValue={[
                moment(filters.from_date),
                moment(filters.to_date)
              ]}
              onChange={handleDateChange}
              style={{ width: 250 }}
            />
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          {Object.entries(statusSummary).map(([status, count]) => (
            <Card key={status} size="small" className="text-center">
              <div className="text-2xl font-bold" style={{ color: statusColors[status] || '#333' }}>
                {count}
              </div>
              <div className="text-sm capitalize">
                {status}
              </div>
            </Card>
          ))}
        </div>

        <Spin spinning={loading}>
          <Collapse ghost className="mb-6">
            {Object.entries(pipelineData).map(([jobOrderId, statusItems]) => {
              const jobOrder = statusItems[0]?.job_order;
              const totalApplications = statusItems.reduce((sum, item) => sum + item.total, 0);
              
              return (
                <Panel 
                  header={
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{jobOrder?.title}</span>
                        <span className="text-gray-500 ml-2">({jobOrder?.job_order_no})</span>
                      </div>
                      <div>
                        <Tag color="blue">{totalApplications} applications</Tag>
                      </div>
                    </div>
                  } 
                  key={jobOrderId}
                >
                  <Table
                    columns={columns}
                    dataSource={statusItems.map(item => ({
                      key: `${jobOrderId}-${item.status}`,
                      job_order_id: jobOrderId,
                      ...item
                    }))}
                    rowKey="key"
                    pagination={false}
                    size="small"
                  />
                </Panel>
              );
            })}
          </Collapse>

          <Card title="Summary View" className="mt-6">
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
                      <span className="font-medium">Total Across All Job Orders:</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <span className="font-medium">{statusSummary.total}</span>
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

export default ApplicationPipelineReport;