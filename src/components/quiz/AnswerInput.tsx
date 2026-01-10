import React, { useState } from 'react';
import Button from '../common/Button';
import InputField from '../common/InputField';

type AnswerInputProps = {
  onSubmit: (answer: string) => void;
  className?: string;
};

export const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, className }) => {
  const [value, setValue] = useState('');

  return (
    <div className={className}>
      <InputField value={value} onChange={setValue} placeholder="ඔබගේ උත්තරය" />
      <Button type="button" onClick={() => onSubmit(value)}>Submit</Button>
    </div>
  );
};

export default AnswerInput;
