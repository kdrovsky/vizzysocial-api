export function removeEmojis(text) {
    // Regular expression to match emojis
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/gu;
  
    // Replace emojis with an empty string
    return text.replace(emojiRegex, '');
  }
  