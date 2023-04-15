import { useEffect, useState } from 'react';
import { useMutation, useQuery, QueryClient, useQueryClient } from "@tanstack/react-query";

type Widget = { id: `w${number}` }
type Gadget = { id: `g${number}` }
type Product = Widget | Gadget;
type ProductId = Product["id"];

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

function findOrCreate<P extends { id: ProductId }>(queryClient: ReturnType<typeof useQueryClient>, queryKey: string[]) {
  const label = queryKey[0].slice(0, -1);
  return async function(newItem: P) {
    const items = queryClient.getQueryData<P[]>(queryKey);

    if (items) {
      const item = items.find(item => item.id === newItem.id);
      if (item) {
        console.warn(`returning existing ${label}`);
        return item;
      }
    }

    console.warn(`POSTing new ${label} to server`);
    return newItem;
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
