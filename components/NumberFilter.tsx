import React, { useState } from 'react';
import { Select, InputNumber, Space } from 'antd';

const { Option } = Select;

export type FilterCondition = 'none' | 'gt' | 'lt' | 'between';

export interface NumberFilterValue {
  condition: FilterCondition;
  value1?: number;
  value2?: number;
}

interface NumberFilterProps {
  value?: NumberFilterValue;
  onChange?: (value: NumberFilterValue) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

const NumberFilter: React.FC<NumberFilterProps> = ({
  value = { condition: 'none' },
  onChange,
  placeholder = '不筛选',
  min,
  max,
  step = 1,
  precision = 0,
}) => {
  const [localValue, setLocalValue] = useState<NumberFilterValue>(value);

  const handleConditionChange = (condition: FilterCondition) => {
    const newValue: NumberFilterValue = {
      condition,
      value1: undefined,
      value2: undefined,
    };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleValue1Change = (val: number | null) => {
    const newValue: NumberFilterValue = {
      ...localValue,
      value1: val ?? undefined,
    };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleValue2Change = (val: number | null) => {
    const newValue: NumberFilterValue = {
      ...localValue,
      value2: val ?? undefined,
    };
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Select
        value={localValue.condition}
        onChange={handleConditionChange}
        style={{ width: '30%' }}
      >
        <Option value="none">不筛选</Option>
        <Option value="gt">大于</Option>
        <Option value="lt">小于</Option>
        <Option value="between">介于</Option>
      </Select>

      {localValue.condition === 'gt' && (
        <InputNumber
          value={localValue.value1}
          onChange={handleValue1Change}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          precision={precision}
          style={{ width: '70%' }}
        />
      )}

      {localValue.condition === 'lt' && (
        <InputNumber
          value={localValue.value1}
          onChange={handleValue1Change}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          precision={precision}
          style={{ width: '70%' }}
        />
      )}

      {localValue.condition === 'between' && (
        <>
          <InputNumber
            value={localValue.value1}
            onChange={handleValue1Change}
            placeholder="最小值"
            min={min}
            max={max}
            step={step}
            precision={precision}
            style={{ width: '35%' }}
          />
          <InputNumber
            value={localValue.value2}
            onChange={handleValue2Change}
            placeholder="最大值"
            min={min}
            max={max}
            step={step}
            precision={precision}
            style={{ width: '35%' }}
          />
        </>
      )}
    </Space.Compact>
  );
};

export default NumberFilter;
