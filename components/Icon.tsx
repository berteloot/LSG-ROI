import React from 'react';

interface IconProps {
  name: 'calculator' | 'unlock' | 'lightbulb' | 'office-building' | 'bullseye' | 'recruitment' | 'financial-services' | 'people' | 'bullseye-night' | 'skyline' | 'financial-services-alt' | 'target' | 'email';
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  // Map icon names to LSG ROI brand icon files
  const iconMap = {
    calculator: '/Icons_ROI/lsg_icon_Calculator_Lavender_Square.svg',
    unlock: '/Icons_ROI/lsg_icon_Unlock_Lavender_Round.svg',
    lightbulb: '/Icons_ROI/lsg_icon_Lightbulb_LeanBlue_Round.svg',
    'office-building': '/Icons_ROI/lsg_icon_OfficeBuilding_SandstoneNight_Round.svg',
    bullseye: '/Icons_ROI/lsg_icon_Bullseye_AquaBreeze_Round.svg',
    'bullseye-night': '/Icons_ROI/lsg_icon_Bullseye_AquaBreezeNight_Square.svg',
    skyline: '/Icons_ROI/lsg_icon_Skyline_SolarOrangeNight_Square.svg',
    recruitment: '/SVG 2/lsg_icon_recruitment-02.svg',
    'financial-services': '/SVG 2/lsg_icon_financialservices02-02.svg',
    'financial-services-alt': '/SVG 2/lsg_icon_financialservices-01.svg',
    people: '/SVG 2/lsg_icon_people-02.svg',
    target: '/Icons_ROI/lsg_icon_Target_AquaBreezeNight_Round.svg',
    email: '/SVG 2/lsg_icon_email-02.svg'
  };
  
  const iconPath = iconMap[name];
  
  return (
    <img
      src={iconPath}
      alt={`${name} icon`}
      className={className}
      width={size}
      height={size}
      style={{ 
        width: size, 
        height: size
      }}
    />
  );
};

export default Icon;
