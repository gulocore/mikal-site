---
layout: layouts/post.njk
tags: blog
thumbnail: /img/blog/hello-world.jpg
sections:
  - type: text
    key: intro
    default: This is my first blog post! I'm excited to share my thoughts and experiences with you.

  - type: heading
    key: gettingStartedHeading
    default: Getting Started

  - type: text
    key: gettingStartedText
    default: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget felis vel nisi bibendum malesuada. Aenean tincidunt fermentum nulla, ac hendrerit justo. Sed eu diam non dui lobortis semper.

  - type: subheading
    key: learnedHeading
    default: What I've Learned

  - type: list
    items:
      - key: learnedItem1
        default: Eleventy is a fantastic static site generator
      - key: learnedItem2
        default: The Nordic Twilight theme looks great
      - key: learnedItem3
        default: Multilingual support makes the site accessible to more people

  - type: heading
    key: nextStepsHeading
    default: Next Steps

  - type: text
    key: nextStepsText
    default: In future posts, I'll be exploring more advanced topics and sharing my projects. Stay tuned for more content coming soon!

  - type: code
    language: javascript
    content: |
      // A simple code example
      function greet(name) {
        return `Hello, ${name}!`;
      }

      console.log(greet('World'));

  - type: text
    key: imageIntro
    default:
      Here's an image example that would show up if the image existed:

  - type: image
    src: /img/blog/sample-image.jpg
    alt: Sample Image
    captionKey: sampleCaption
    caption: A sample image caption

  - type: text
    key: outro
    default: Check back soon for more updates!
---