import { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Spin, message } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { baseURL } from '../../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const { RangePicker } = DatePicker;
const { Option } = Select;

const JobOffersReport = () => {
  const [offers, setOffers] = useState([]);
  const user = localStorage.getItem('user');
  const token = JSON.parse(user).token.access_token
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'sent',
    from_date: '2025-03-01',
    to_date: '2025-08-01'
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      // Construct query parameters in the specified format
      const params = new URLSearchParams();
      params.append('status', filters.status);
      params.append('from_date', filters.from_date);
      params.append('to_date', filters.to_date);
      
      const response = await axios.get(`${baseURL}/reports/recruitments/job-offers?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOffers(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch offers');
      }
    } catch (error) {
      message.error('Error fetching job offers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
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

  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value
    });
  };

  const columns = [
    {
      title: 'Offer Number',
      dataIndex: 'offer_number',
      key: 'offer_number',
      sorter: (a, b) => a.offer_number.localeCompare(b.offer_number),
    },
    {
      title: 'Candidate',
      dataIndex: ['application', 'candidate', 'current_job_title'],
      key: 'candidate',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.application.candidate.current_job_title}</div>
          <div className="text-xs text-gray-500">{record.application.candidate.location}</div>
        </div>
      ),
    },
    {
      title: 'Job Position',
      dataIndex: ['application', 'job_order', 'title'],
      key: 'position',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.application.job_order.title}</div>
          <div className="text-xs text-gray-500">{record.application.job_order.location_details}</div>
        </div>
      ),
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (value) => `${parseFloat(value).toLocaleString()}`,
      sorter: (a, b) => parseFloat(a.salary) - parseFloat(b.salary),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'sent' ? 'bg-blue-100 text-blue-800' :
          status === 'accepted' ? 'bg-green-100 text-green-800' :
          status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Sent', value: 'sent' },
        { text: 'Accepted', value: 'accepted' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Sent At',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (date) => date ? moment(date).format('MMM D, YYYY') : 'Not sent',
      sorter: (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Job Offers Report"
        bordered={false}
        extra={
          <Button type="primary" onClick={fetchOffers} loading={loading}>
            Refresh
          </Button>
        }
      >
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              defaultValue="sent"
              style={{ width: 200 }}
              onChange={handleStatusChange}
            >
              <Option value="draft">Draft</Option>
              <Option value="sent">Sent</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="rejected">Rejected</Option>
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

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={offers}
            rowKey="offer_number"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <span className="font-medium">Total Offers:</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span className="font-medium">{offers.length}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default JobOffersReport;