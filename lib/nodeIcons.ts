/**
 * Ícone lucide-react de cada tipo de entidade (lista em https://lucide.dev/icons).
 * Fonte única: barra lateral, glossário e painel de detalhes leem daqui, para o
 * mesmo tipo ter sempre o mesmo ícone. As cores ficam em NODE_STYLE (graphConfig).
 */
import type { ElementType } from 'react';
import { ShieldExclamationPoint, Layers, UserCheck, BuildingComplex, Briefcase } from 'lucide-react';
import type { NodeType } from '@/types/graph';

export const NODE_ICONS: Record<NodeType, ElementType> = {
  politician: UserCheck,
  party: Layers,
  scheme: ShieldExclamationPoint,
  company: BuildingComplex,
  operator: Briefcase,
};
