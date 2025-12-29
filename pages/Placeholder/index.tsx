import React from 'react';
import { Result, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

interface PlaceholderProps {
  title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg p-12">
      <Result
        icon={<SettingOutlined style={{ color: '#6C6C9C' }} />}
        title={`${title} - Feature Under Development`}
        subTitle="We are working hard to bring you this feature. Stay tuned!"
        extra={<Button type="primary">Back Home</Button>}
      />
    </div>
  );
};

export default Placeholder;
