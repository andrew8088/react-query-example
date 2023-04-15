import { useEffect, useState } from 'react';
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";

type Widget = { id: `w${number}` }
type Gadget = { id: `g${number}` }

function isWidgetId(id: string): id is Widget['id'] {
  return id.startsWith('w');
}

export function useGetWidgets() {
  return useQuery({
    queryKey: ["widgets"],
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
    queryKey: ["gadgets"],
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
  return useMutation(async function(widget: Widget) {
    console.log('POSTing new widget to server');
    return widget;
  });
}

export function usePostGadget() {
  return useMutation(async function(gadget: Gadget) {
    console.log('POSTing new gadget to server');
    return gadget;
  });
}

type Product = Widget | Gadget;

export function useGetOrCreateProduct() {
  const [product, setProduct] = useState<Product | null>(null);

  const { data: widgets } = useGetWidgets();
  const { data: gadgets } = useGetGadgets();

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
      const isWidget = isWidgetId(id);

      if (isWidget && widgets) {
        const widget = widgets.find(w => w.id === id);
        if (widget) {
          setProduct(widget);
          return;
        }
      }

      if (!isWidget && gadgets) {
        const gadget = gadgets.find(w => w.id === id);
        if (gadget) {
          setProduct(gadget);
          return;
        }
      }

      if (isWidget) {
        createWidget({ id });
      } else {
        createGadget({ id });
      }
    },
    data: product
  };
}

export const queryClient = new QueryClient();
