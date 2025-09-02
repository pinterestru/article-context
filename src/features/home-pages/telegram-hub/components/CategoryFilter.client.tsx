'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Code2, 
  TrendingUp, 
  Briefcase, 
  Palette, 
  BarChart3, 
  Heart, 
  Globe2, 
  Baby, 
  Video, 
  GraduationCap, 
  Monitor,
  Grid3x3
} from 'lucide-react'
import type { CategoryKey } from '../types'

interface CategoryFilterProps {
  categories: Record<string, string>
  activeCategory: CategoryKey
  onCategoryChange: (category: CategoryKey) => void
}

const categoryIcons: Record<CategoryKey, React.ReactNode> = {
  'all': <Grid3x3 className="w-4 h-4" />,
  'programming': <Code2 className="w-4 h-4" />,
  'marketing': <TrendingUp className="w-4 h-4" />,
  'management': <Briefcase className="w-4 h-4" />,
  'design': <Palette className="w-4 h-4" />,
  'analytics': <BarChart3 className="w-4 h-4" />,
  'lifestyle': <Heart className="w-4 h-4" />,
  'languages': <Globe2 className="w-4 h-4" />,
  'kids': <Baby className="w-4 h-4" />,
  'content-creation': <Video className="w-4 h-4" />,
  'business-courses': <GraduationCap className="w-4 h-4" />,
  'higher-education': <Monitor className="w-4 h-4" />,
  'ege': <GraduationCap className="w-4 h-4" />
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Object.entries(categories).map(([key, label]) => {
        const icon = categoryIcons[key as CategoryKey]
        return (
          <Button
            key={key}
            variant={activeCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(key as CategoryKey)}
            className={cn(
              "transition-all flex items-center gap-2",
              activeCategory === key && "shadow-sm"
            )}
          >
            {icon}
            <span>{label}</span>
          </Button>
        )
      })}
    </div>
  )
}