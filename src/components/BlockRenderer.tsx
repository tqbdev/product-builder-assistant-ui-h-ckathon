import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Video,
  Shield,
  Umbrella,
  Users,
  Dumbbell,
  Car,
  Anchor,
  Heart,
  Smartphone
} from 'lucide-react';

interface BlockConfig {
  className?: string;
  icon?: string | null;
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

const getIcon = (iconName: string | null) => {
  console.log("🚀 ~ getIcon ~ iconName:", iconName)
  if (!iconName) return null;
  
  // Remove 'Lucide' prefix if it exists
  const cleanIconName = iconName.replace('Lucide', '');
  
  const icons: { [key: string]: React.ReactNode } = {
    'DollarSign': <DollarSign className="w-5 h-5 inline-block mr-2" />,
    'Video': <Video className="w-5 h-5 inline-block mr-2" />,
    'Shield': <Shield className="w-5 h-5 inline-block mr-2" />,
    'Umbrella': <Umbrella className="w-5 h-5 inline-block mr-2" />,
    'Users': <Users className="w-5 h-5 inline-block mr-2" />,
    'Dumbbell': <Dumbbell className="w-5 h-5 inline-block mr-2" />,
    'Car': <Car className="w-5 h-5 inline-block mr-2" />,
    'Anchor': <Anchor className="w-5 h-5 inline-block mr-2" />,
    'Heart': <Heart className="w-5 h-5 inline-block mr-2" />,
    'Smartphone': <Smartphone className="w-5 h-5 inline-block mr-2" />
  };

  return icons[cleanIconName] || null;
};

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
    const styled = block?.config?.className;
    const icon = block?.config?.icon;

    switch (block.type) {
      case 'heading':
        return (
          <h1 className={styled}>
            {getIcon(icon)}
            {block.data as string}
          </h1>
        );
      case 'text':
        return (
          <p className={styled}>
            {getIcon(icon)}
            {block.data as string}
          </p>
        );
      case 'paragraph':
        return (
          <p className={styled}>
            {getIcon(icon)}
            {block.data as string}
          </p>
        );
      case 'bulleted list item':
        return (
          <li className={styled}>
            {getIcon(icon)}
            {block.data as string}
          </li>
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
        return (
          <p className={styled}>
            {getIcon(icon)}
            {block.data as string}
          </p>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {blocks.map((block, index) => renderBlock(block))}
    </div>
  );
};

export default BlockRenderer; 