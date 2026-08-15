import re

ACRONYMS = {"GST", "MSME", "CBSE", "ICSE", "NRI", "UPI", "NEFT", "TALLY", "PDF", "HD", "IT", "HR", "BBA", "BCOM", "CA"}
LOWERCASE_WORDS = {"and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet", "with", "a", "an"}

def capitalize_title(text: str) -> str:
    """
    Formats a title into standard English Title Case with acronym preservation.
    """
    if not text:
        return ""
    words = re.split(r'(\s+)', text.strip())
    result = []
    for i, word in enumerate(words):
        if not word.strip():
            result.append(word)
            continue
        clean = re.sub(r'[^\w\s]', '', word).upper()
        if clean in ACRONYMS:
            result.append(clean)
        elif i > 0 and word.lower() in LOWERCASE_WORDS:
            result.append(word.lower())
        else:
            result.append(word.capitalize())
    return "".join(result)

def capitalize_sentences(text: str) -> str:
    """
    Ensures every sentence starts with a capital letter and ends with clean punctuation.
    """
    if not text:
        return ""
    text = text.strip()
    sentences = re.split(r'([.!?]\s+)', text)
    result = []
    for s in sentences:
        if re.match(r'^[.!?]\s+$', s):
            result.append(s)
        elif s:
            result.append(s[0].upper() + s[1:])
    combined = "".join(result).strip()
    if combined and combined[-1] not in {'.', '!', '?'}:
        combined += '.'
    return combined
