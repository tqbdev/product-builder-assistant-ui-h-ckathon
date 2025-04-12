import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Add this import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

export function TravelInsuranceForm({ schema, logic }: TravelInsuranceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Add your API call here
      const functionString = logic?.definition;
      const calculatePremium = eval(`(${functionString})`);
      const premium = calculatePremium(formData);
      console.log('premium: ', premium);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
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
              value={formData[name] || ''}
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
            value={formData[name]}
            onChange={(e) => handleChange(name, e.target.value)}
            min={minimum}
            max={maximum}
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
            {description}
          </Label>
          {inputElement}
        </div>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    );
  };

  if (!schema || !schema.properties) {
    return <div>Schema not provided or invalid.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto py-8 px-4">
      <div className="space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{schema.title}</h2>
        {schema.description && (
          <p className="text-lg text-gray-600 leading-relaxed">
            {schema.description}
          </p>
        )}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
        {Object.entries(schema.properties).map(([name, property]) => (
          <div
            key={name}
            className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
          >
            {renderInput(name, property)}
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}