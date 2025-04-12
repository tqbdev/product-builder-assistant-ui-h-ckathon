export interface RichText {
  type: 'text';
  text: {
    content: string;
    link: string | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

export interface BaseBlock {
  object: 'block';
  type: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: RichText[];
    color: string;
  };
}

export interface Heading1Block extends BaseBlock {
  type: 'heading_1';
  heading_1: {
    rich_text: RichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface Heading2Block extends BaseBlock {
  type: 'heading_2';
  heading_2: {
    rich_text: RichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface Heading3Block extends BaseBlock {
  type: 'heading_3';
  heading_3: {
    rich_text: RichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface BulletedListItemBlock extends BaseBlock {
  type: 'bulleted_list_item';
  bulleted_list_item: {
    rich_text: RichText[];
    color: string;
    children?: NotionBlock[];
  };
}

export interface NumberedListItemBlock extends BaseBlock {
  type: 'numbered_list_item';
  numbered_list_item: {
    rich_text: RichText[];
    color: string;
    children?: NotionBlock[];
  };
}

export interface ToDoBlock extends BaseBlock {
  type: 'to_do';
  to_do: {
    rich_text: RichText[];
    checked: boolean;
    color: string;
    children?: NotionBlock[];
  };
}

export interface ToggleBlock extends BaseBlock {
  type: 'toggle';
  toggle: {
    rich_text: RichText[];
    color: string;
    children?: NotionBlock[];
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  quote: {
    rich_text: RichText[];
    color: string;
    children?: NotionBlock[];
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: {
    rich_text: RichText[];
    language: string;
  };
}

export type NotionBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | ToggleBlock
  | QuoteBlock
  | CodeBlock; 