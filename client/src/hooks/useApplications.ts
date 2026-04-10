import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, aiApi } from '@/api';
import { Application, CreateApplicationInput, ParsedJob } from '@/types';
import toast from 'react-hot-toast';
import axios from 'axios';

const QUERY_KEY = ['applications'] as const;

function getErrMsg(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return err.response?.data?.message ?? fallback;
  return fallback;
}

export function useApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await applicationsApi.getAll();
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationInput) => applicationsApi.create(data),
    onSuccess: (res) => {
      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old ? [res.data, ...old] : [res.data]
      );
      toast.success('Application added! You got this. 💪');
    },
    onError: (err) => toast.error(getErrMsg(err, 'Failed to create application')),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApplicationInput> }) =>
      applicationsApi.update(id, data),
    onSuccess: (res) => {
      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old?.map((a) => (a._id === res.data._id ? res.data : a)) ?? []
      );
      toast.success('Updated! Stay organized. 🗂️');
    },
    onError: (err) => toast.error(getErrMsg(err, 'Failed to update')),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: (_res, id) => {
      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old?.filter((a) => a._id !== id) ?? []
      );
      toast.success('Deleted. Onward to better opportunities! 🚀');
    },
    onError: (err) => toast.error(getErrMsg(err, 'Failed to delete')),
  });
}

export function useParseJD() {
  return useMutation({
    mutationFn: (jd: string) => aiApi.parse(jd).then((r) => r.data),
    onError: (err) => toast.error(getErrMsg(err, 'AI parsing failed. Try again!')),
  });
}

export function useSuggestBullets() {
  return useMutation({
    mutationFn: (job: ParsedJob) => aiApi.suggest(job).then((r) => r.data.bullets),
    onError: (err) => toast.error(getErrMsg(err, 'Could not generate bullets.')),
  });
}
