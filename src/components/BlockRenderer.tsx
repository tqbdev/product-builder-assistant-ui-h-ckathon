import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BlockConfig {
  size: string;
  bold: boolean;
  color: string;
  plans?: string[];
}

interface Plan {
  label: string;
  values: string[];
}

interface BenefitsSection {
  section: string;
  plans: Plan[];
}

interface BenefitsData {
  config: {
    plans: string[];
  };
  sections: BenefitsSection[];
}

type BlockData = string | string[][] | BenefitsData;

interface Block {
  type: string;
  data: BlockData;
  config?: BlockConfig;
}

interface BlockRendererProps {
  blocks: Block[];
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(index)) {
      newExpandedSections.delete(index);
    } else {
      newExpandedSections.add(index);
    }
    setExpandedSections(newExpandedSections);
  };

  const renderBlock = (block: Block) => {
    const style = {
      fontSize: block?.config?.size,
      fontWeight: block?.config?.bold ? 'bold' : 'normal',
      color: block?.config?.color,
      marginBottom: '0.5rem',
    };

    switch (block.type) {
      case 'heading':
        return <h2 style={style}>{block.data as string}</h2>;
      case 'text':
        return <p style={style}>{block.data as string}</p>;
      case 'paragraph':
        return <p style={style}>{block.data as string}</p>;
      case 'bulleted list item':
        return (
          <li style={{ ...style, listStyleType: 'disc', marginLeft: '1.5rem' }}>
            {block.data as string}
          </li>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <tbody>
                {(block.data as string[][]).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className={`px-4 py-2 border border-gray-200 ${rowIndex === 0 ? 'font-semibold' : ''}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'benefits':
        const benefitsData = block.data as BenefitsData;
        return (
          <div className="space-y-4">
            {benefitsData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">
                    {section.section}
                  </h3>
                  {expandedSections.has(sectionIndex) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedSections.has(sectionIndex) && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Benefit
                          </th>
                          {benefitsData.config.plans.map((planName, index) => (
                            <th 
                              key={index}
                              className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {planName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.plans.map((plan, planIndex) => (
                          <tr key={planIndex} className={planIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {plan.label}
                            </td>
                            {plan.values.map((value, valueIndex) => (
                              <td 
                                key={valueIndex} 
                                className="px-4 py-3 text-sm text-center text-gray-900"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return <p style={style}>{block.data as string}</p>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {blocks.map((block, index) => (
        <React.Fragment key={index}>{renderBlock(block)}</React.Fragment>
      ))}
    </div>
  );
};

export default BlockRenderer; 