import { useEffect, useState } from 'react';
import { useMutation, useQuery, QueryClient, useQueryClient } from "@tanstack/react-query";

type Widget = { id: `w${number}` }
type Gadget = { id: `g${number}` }

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

export function usePostWidget() {
  const queryClient = useQueryClient();
  return useMutation(async function(newWidget: Widget) {
    const widgets = queryClient.getQueryData<Widget[]>(WIDGET_KEY);

    if (widgets) {
      const widget = widgets.find(w => w.id === newWidget.id);
      if (widget) {
        console.warn('returning existing widget');
        return widget;
      }
    }

    console.warn('POSTing new widget to server');
    return newWidget;
  });
}

export function usePostGadget() {
  const queryClient = useQueryClient();
  return useMutation(async function(newGadget: Gadget) {
    const gadgets = queryClient.getQueryData<Gadget[]>(GADGET_KEY);

    if (gadgets) {
      const gadget = gadgets.find(w => w.id === newGadget.id);
      if (gadget) {
        console.warn('returning existing gadget');
        return gadget;
      }
    }

    console.warn('POSTing new gadget to server');
    return newGadget;
  });
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
