import type { ComponentType } from 'react';
import type { WidgetConfig } from './config-parser';
import type { WidgetData } from '@/lib/article/widget-data-fetcher';

// Widget component props interface
export interface WidgetComponentProps {
  config: WidgetConfig;
  data: WidgetData;
  className?: string;
}

// Widget registry for server-side components
interface WidgetRegistryEntry {
  component: ComponentType<WidgetComponentProps>;
  requiresData: boolean;
  skeleton?: ComponentType<{ className?: string }>;
}

class ServerWidgetRegistry {
  private widgets = new Map<string, WidgetRegistryEntry>();

  register(type: string, entry: WidgetRegistryEntry): void {
    this.widgets.set(type, entry);
  }

  get(type: string): WidgetRegistryEntry | undefined {
    return this.widgets.get(type);
  }

  has(type: string): boolean {
    return this.widgets.has(type);
  }

  getAll(): Map<string, WidgetRegistryEntry> {
    return new Map(this.widgets);
  }
}

// Create singleton instance
export const widgetRegistry = new ServerWidgetRegistry();

// Register widgets
import { PromocodeListWidget } from '../promocode-list/components/PromocodeListWidget';
import { PromocodeListSkeleton } from '../promocode-list';

widgetRegistry.register('promocode_list', {
  component: PromocodeListWidget,
  requiresData: false, // Self-contained data fetching
  skeleton: PromocodeListSkeleton,
});