import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  variant?: 'default' | 'card' | 'table' | 'form' | 'agenda' | 'quorum';
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ 
  variant = 'default', 
  className,
  count = 1 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={cn('w-full', className)}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <div className={cn('space-y-3', className)}>
            {/* Header */}
            <div className="flex space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            {/* Rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className={cn('space-y-4', className)}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        );

      case 'agenda':
        return (
          <Card className={cn('w-full', className)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-6 w-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'quorum':
        return (
          <Card className={cn('w-full', className)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center space-y-1">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center space-y-1">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center space-y-1">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className={cn('space-y-2', className)}>
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
}

// Componentes específicos para contextos comuns
export function MeetingDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <LoadingSkeleton key={i} variant="card" />
      ))}
      
      {/* Quorum */}
      <LoadingSkeleton variant="quorum" />
      
      {/* Agenda */}
      <LoadingSkeleton variant="agenda" count={3} />
      
      {/* Tables */}
      <LoadingSkeleton variant="table" count={4} />
    </div>
  );
}

export function AgendaManagerSkeleton() {
  return <LoadingSkeleton variant="agenda" count={4} />;
}

export function QuorumIndicatorSkeleton() {
  return <LoadingSkeleton variant="quorum" />;
}

export default LoadingSkeleton;