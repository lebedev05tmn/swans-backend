import { ValueTransformer } from 'typeorm';

export const PointTransformer: ValueTransformer = {
    to: (value: { x: number; y: number } | null) => {
        return value ? `(${value.x},${value.y})` : null;
    },

    from: (value: string | null) => {
        if (!value) return null;

        if (typeof value === 'object') return value;

        const match = value.match(/[(-]?([\d.]+)\s*,\s*([\d.]+)[)]?/);
        if (!match) return null;

        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
        };
    },
};
