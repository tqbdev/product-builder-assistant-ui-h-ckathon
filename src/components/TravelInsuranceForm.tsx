import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';

interface SchemaProperty {
  title: string;
  description?: string;
  type: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  readOnly?: boolean;
  default?: any;
}

interface Schema {
  title: string;
  description?: string;
  properties: Record<string, SchemaProperty>;
}

interface TravelInsuranceFormProps {
  schema: Schema;
  logic?: any; // Add this prop for logic handling if needed
}

interface PremiumResult {
  basePremium: number;
  cruiseOptionPremium: number;
  childUpgradeOptionPremium: number;
  totalOptionsPremium: number;
  totalPremiumBeforeLevy: number;
  levyAmount: number;
  finalPremiumPayable: number;
}

export function TravelInsuranceForm({ schema, logic }: TravelInsuranceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [premiumResult, setPremiumResult] = useState<PremiumResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with default values
  useEffect(() => {
    if (schema?.properties) {
      const defaultValues = Object.entries(schema.properties).reduce((acc, [key, prop]) => ({
        ...acc,
        [key]: prop.default || (prop.type === 'boolean' ? false : '')
      }), {});
      setFormData(defaultValues);
      calculatePremiumResult(defaultValues);
    }
  }, [schema]);

  const calculatePremiumResult = async (data: Record<string, any>) => {
    const processedData = Object.entries(data).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value
    }), {});
    
    console.log("🚀 ~ calculatePremiumResult ~ data:", processedData)
    setIsCalculating(true);
    setError(null);
    try {
      const functionString = logic?.definition;
      if (!functionString) {
        throw new Error('Premium calculation logic not provided');
      }
      const calculatePremium = eval(`(${functionString})`);
      const premium = calculatePremium(processedData);
      console.log("🚀 ~ calculatePremiumResult ~ premium:", premium)
      setPremiumResult(premium);
    } catch (error) {
      console.error('Error calculating premium:', error);
      setError('Failed to calculate premium. Please check your inputs.');
      setPremiumResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const renderPremiumTable = (result: Record<string, any>) => {
    return Object.entries(result).map(([key, value], index, array) => {
      const isLastItem = index === array.length - 1;
      const formattedValue = typeof value === 'number' ? formatCurrency(value) : value;

      return (
        <tr
          key={key}
          className={`
            ${!isLastItem ? 'border-b' : ''} 
            ${isLastItem ? 'font-semibold bg-gray-50' : ''}
            hover:bg-gray-50 transition-colors
          `}
        >
          <td className="py-3 px-4 text-gray-600">{formatPremiumKey(key)}</td>
          <td className="py-3 px-4 text-right font-medium">{formattedValue}</td>
        </tr>
      );
    });
  };

  const renderPremiumResults = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Please fill out all required fields!
        </div>
      );
    }

    if (isCalculating) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      );
    }

    if (premiumResult) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Premium Calculation Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>{renderPremiumTable(premiumResult)}</tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  const handleChange = (name: string, value: any) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    calculatePremiumResult(newFormData);
  };

  const renderInput = (name: string, property: SchemaProperty) => {
    const { title, description, type, enum: enumValues, minimum, maximum, readOnly, default: defaultValue } = property;

    let inputElement;

    switch (type) {
      case 'boolean':
        inputElement = (
          <Checkbox
            id={name}
            checked={formData[name] || false}
            onCheckedChange={(checked) => handleChange(name, checked)}
            disabled={readOnly}
            className="h-5 w-5"
          />
        );
        break;
      case 'string':
        if (enumValues) {
          inputElement = (
            <Select
              value={formData[name] || ''}
              onValueChange={(value) => handleChange(name, value)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-lg shadow-sm">
                <SelectValue placeholder={`Select ${description}`} />
              </SelectTrigger>
              <SelectContent>
                {enumValues.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="hover:bg-blue-50"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else {
          inputElement = (
            <Input
              type="text"
              id={name}
              onChange={(e) => handleChange(name, e.target.value)}
              disabled={readOnly}
              className="h-12 bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          );
        }
        break;
      case 'integer':
      case 'number':
        inputElement = (
          <Input
            type="number"
            id={name}
            onChange={(e) => handleChange(name, parseFloat(e.target.value) || 0)}
            min={minimum}
            max={maximum}
            step="0.01"
            disabled={readOnly}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <div key={name} className="space-y-2">
        <div className={`flex ${type === 'boolean' ? 'flex-row-reverse justify-end gap-2 items-center' : 'flex-col'}`}>
          <Label htmlFor={name} className="text-lg font-medium text-gray-900">
            {title || description}
          </Label>
          {inputElement}
        </div>
      </div>
    );
  };

  if (!schema || !schema.properties) {
    return <div>Schema not provided or invalid.</div>;
  }

  const formatPremiumKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .replace(/Premium/g, '') // Remove the word "Premium" for cleaner display
      .trim();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{schema.title}</h2>
        {schema.description && (
          <p className="text-lg text-gray-600 leading-relaxed">
            {schema.description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-fit">
          {Object.entries(schema.properties).map(([name, property]) => (
            <div
              key={name}
              className="pb-4 mb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
            >
              {renderInput(name, property)}
            </div>
          ))}
        </div>
        <div className="lg:sticky lg:top-8">
          {renderPremiumResults()}
        </div>
      </div>
    </div>
  );
}