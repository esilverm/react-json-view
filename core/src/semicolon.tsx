import type { FC, PropsWithChildren } from 'react';
import { useMemo, useRef, useEffect } from 'react';
import { Label } from './value';
import type { LabelProps } from './value';
import type { JsonViewProps } from './';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface UseHighlight {
  value: any;
  highlightUpdates?: boolean;
  highlightContainer: React.MutableRefObject<HTMLSpanElement | null>;
}

export function useHighlight({ value, highlightUpdates, highlightContainer }: UseHighlight) {
  const prevValue = usePrevious(value);
  const isHighlight = useMemo(() => {
    if (!highlightUpdates || prevValue === undefined) return false;
    // highlight if value type changed
    if (typeof value !== typeof prevValue) {
      return true;
    }
    if (typeof value === 'number') {
      // notice: NaN !== NaN
      if (isNaN(value) && isNaN(prevValue as unknown as number)) return false;
      return value !== prevValue;
    }
    // highlight if isArray changed
    if (Array.isArray(value) !== Array.isArray(prevValue)) {
      return true;
    }
    // not highlight object/function
    // deep compare they will be slow
    if (typeof value === 'object' || typeof value === 'function') {
      return false;
    }

    // highlight if not equal
    if (value !== prevValue) {
      return true;
    }

    return false;
  }, [highlightUpdates, value]);

  useEffect(() => {
    if (highlightContainer && highlightContainer.current && isHighlight && 'animate' in highlightContainer.current) {
      highlightContainer.current.animate(
        [{ backgroundColor: 'var(--w-rjv-update-color, #ebcb8b)' }, { backgroundColor: '' }],
        {
          duration: 1000,
          easing: 'ease-in',
        },
      );
    }
  }, [isHighlight, value, highlightContainer]);
}

export interface SemicolonProps extends LabelProps {
  highlightUpdates?: boolean;
  keyName?: string | number;
  parentName?: string | number;
  quotes?: JsonViewProps<object>['quotes'];
  value?: object;
  label?: string;
  namespace?: Array<string | number>;
  render?: (props: SemicolonProps) => React.ReactNode;
}

export const Semicolon: FC<PropsWithChildren<SemicolonProps>> = ({
  children,
  render,
  color,
  value,
  className = 'w-rjv-object-key',
  keyName,
  highlightUpdates,
  quotes,
  style,
  namespace,
  parentName,
  ...props
}) => {
  const highlightContainer = useRef<HTMLSpanElement>(null);
  const content = typeof keyName === 'string' ? `${quotes}${keyName}${quotes}` : keyName;
  if (render) {
    return render({
      className,
      ...props,
      value,
      namespace,
      style: { ...style, color },
      parentName,
      keyName,
      quotes,
      label: keyName as string,
      children: content,
    });
  }
  useHighlight({ value, highlightUpdates, highlightContainer });
  return (
    <Label className={className} color={color} {...props} ref={highlightContainer}>
      {content}
    </Label>
  );
};
