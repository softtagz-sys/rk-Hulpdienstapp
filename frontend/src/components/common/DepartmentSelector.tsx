import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  selectedDepartment,
  onDepartmentChange
}) => {
  const departments = ['Sint-Job', 'Rand'];

  return (
    <div className="relative">
      <select
        value={selectedDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        {departments.map(dept => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  );
};

export default DepartmentSelector;