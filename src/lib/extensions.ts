import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import RenderSuggestions, { CommandItem } from "@/components/widgets/components/RenderSuggestions";
import DefaultCommandItems from "@/components/widgets/components/DefaultCommandItems";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    slashSuggestion: {
      setSlashSuggestion: () => ReturnType;
    };
  }
}

export interface SlashSuggestionOptions {
  suggestion?: Partial<SuggestionOptions>;
  commandItems?: CommandItem[];
  options?: any;
}

export const filterCommandItems = (
  query: string | undefined,
  commandItems: CommandItem[] = DefaultCommandItems
): CommandItem[] => {
  const normalizedQuery = query?.toLowerCase().trim() ?? "";

  if (!normalizedQuery) {
    return commandItems;
  }

  const matchingItems = commandItems.filter((item) => {
    const title = item.title.toLowerCase();
    return (
      title.includes(normalizedQuery) ||
      normalizedQuery.split(" ").every((word) => title.includes(word))
    );
  });

  return matchingItems.length > 0
    ? matchingItems
    : [{ title: "No results found", disabled: true, command: () => {} }];
};

const SlashSuggestion = Extension.create<SlashSuggestionOptions>({
  name: "slash-suggestion",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: any;
          range: any;
          props: any;
        }) => {
          props.command({ editor, range });
        },
        items: ({ query }: { query: string }) => {
          return filterCommandItems(query, this.parent().commandItems);
        },
        render: () => {
          let component: ReturnType<typeof RenderSuggestions>;

          return {
            onStart: (props: any) => {
              component = RenderSuggestions();
              component.onStart(props);
            },
            onUpdate(props: any) {
              component.onUpdate(props);
            },
            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                return true;
              }
              return component.onKeyDown?.(props) ?? false;
            },
            onExit() {
              component.onExit();
            },
          };
        },
      },
      commandItems: [] as CommandItem[],
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: RenderSuggestions,
      } as SuggestionOptions),
    ];
  },
});

export default SlashSuggestion;
