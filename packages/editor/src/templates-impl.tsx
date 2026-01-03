import { Element } from "@craftjs/core";
import {
  AccordionBlock,
  ButtonBlock,
  CalloutBlock,
  CardBlock,
  GridBlock,
  HeadingBlock,
  MediaEmbedBlock,
  PageCanvas,
  ParagraphBlock,
  RepeatableGridBlock,
} from "./blocks";
import type { EditorTemplate } from "./types";

export const templateLibrary: EditorTemplate[] = [
  {
    id: "blank",
    name: "Blank page",
    category: "General",
    description: "Start from a clean canvas with Craft.js blocks.",
    render: () => (
      <Element is={PageCanvas} canvas padding={32} gap={20} background="#f8fafc">
        <HeadingBlock level="h1" text="Untitled page" />
        <ParagraphBlock text="Start adding blocks from the palette on the left." />
      </Element>
    ),
  },
  {
    id: "restaurant-hero",
    name: "Restaurant hero",
    category: "Homepage",
    description: "Hero layout with CTA and feature grid for a menu.",
    render: () => (
      <Element is={PageCanvas} canvas padding={32} gap={20} background="#f8fafc">
        <GridBlock columns={2} gap={18}>
          <div>
            <HeadingBlock level="h1" text="Serve better. Grow faster." />
            <ParagraphBlock text="Craft your homepage hero with CTA and supporting points." />
            <ButtonBlock label="View menu" href="/menu" variant="primary" />
          </div>
          <MediaEmbedBlock alt="Dining room" />
        </GridBlock>
        <GridBlock columns={3} gap={14}>
          <CardBlock title="Fresh" body="Local ingredients daily." />
          <CardBlock title="Fast" body="Online bookings ready." />
          <CardBlock title="Friendly" body="Mobile-first experience." />
        </GridBlock>
      </Element>
    ),
  },
  {
    id: "gallery-with-faq",
    name: "Gallery + FAQ",
    category: "General",
    description: "Media-forward section with supporting FAQ accordion.",
    render: () => (
      <Element is={PageCanvas} canvas padding={32} gap={20} background="#f8fafc">
        <HeadingBlock level="h2" text="Take a look inside" />
        <GridBlock columns={2} gap={16}>
          <RepeatableGridBlock tableId="media" template="{{name}}" limit={6} />
          <AccordionBlock
            items={[
              { title: "Do you host events?", body: "Yes, private dining for up to 30 guests." },
              { title: "Do you support delivery?", body: "Delivery and pickup are available from our app." },
            ]}
          />
        </GridBlock>
        <CalloutBlock tone="info" text="Global sections can insert the site header and footer automatically." />
      </Element>
    ),
  },
];

export const starterTemplate = templateLibrary[0];
