import { useEffect, useState } from 'react';
import { useMutation, useQuery, QueryClient, useQueryClient } from "@tanstack/react-query";

type Widget = { id: string; } // `w${number}` }
type Gadget = { id: string; } // `g${number}` }

function isWidgetId(id: string): id is Widget['id'] {
  return id.startsWith('w');
}

const WIDGET_KEY = ["widgets"];
const GADGET_KEY = ["gadgets"];

export function useGetWidgets() {
  return useQuery({
    queryKey: WIDGET_KEY,
    queryFn: async (): Promise<Widget[]> => {
      console.log('GETing widgets from server');
      return [
        { id: 'w1' },
        { id: 'w2' },
        { id: 'w3' },
      ]
    },
  });
}

export function useGetGadgets() {
  return useQuery({
    queryKey: GADGET_KEY,
    queryFn: async (): Promise<Gadget[]> => {
      console.log('GETing gadgets from server');
      return [
        { id: 'g1' },
        { id: 'g2' },
        { id: 'g3' },
      ]
    },
  });
}

function findById<T extends { id: string }>(collection: T[] | undefined, id: string): T | undefined {
  if (collection) {
    const item = collection.find(item => item.id === id);
    if (item) {
      return item;
    }
  }
}

function findOrCreate<T extends { id: string }>(queryClient: ReturnType<typeof useQueryClient>, queryKey: string[]) {
  return async function(newT: T) {
    const item = findById(queryClient.getQueryData<T[]>(queryKey), newT.id);

    const label = queryKey[0].slice(0, -1);
    if (item) {
      console.warn(`returning existing ${label}`);
      return item;
    }

    console.warn(`POSTing new ${label} to server`);
    return newT;
  }
}

export function usePostWidget() {
  const queryClient = useQueryClient();
  return useMutation(findOrCreate(queryClient, WIDGET_KEY));
}

export function usePostGadget() {
  const queryClient = useQueryClient();
  return useMutation(findOrCreate(queryClient, GADGET_KEY));
}

type Product = Widget | Gadget;

export function useGetOrCreateProduct() {
  const [product, setProduct] = useState<Product | null>(null);

  const { mutate: createWidget, data: newWidget, reset: resetCreateWidget } = usePostWidget();
  const { mutate: createGadget, data: newGadget, reset: resetCreateGadget } = usePostGadget();

  useEffect(() => {
    console.log('useEffect', { newWidget, newGadget });
    if (newWidget) {
      setProduct(newWidget);
      resetCreateWidget();
    }
    if (newGadget) {
      setProduct(newGadget);
      resetCreateGadget();
    }
  }, [newWidget, newGadget]);

  return {
    mutate: (id: Widget["id"] | Gadget["id"]) => {
      if (isWidgetId(id)) {
        createWidget({ id });
      } else {
        createGadget({ id });
      }
    },
    data: product
  };
}

export const queryClient = new QueryClient();
