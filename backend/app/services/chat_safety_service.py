import re
from typing import Dict, Any, Optional

class ChatSafetyFilter:
    """
    Robust NLP & Pattern-based Senior Fraud, Identity & Personal Safety Filter.
    Detects attempts to share or harvest:
    1. Financial Info: Bank Account, IFSC, Card numbers, CVV, OTP, UPI PIN, UPI handles
    2. Personal Identity: Mobile Phone Numbers, Aadhaar Numbers, PAN Cards, Passwords
    3. Physical Address / Location: Door/Flat numbers, Street/Colony, Pincodes
    4. Threat Words & Harassment/Extortion terms
    """

    # 1. Mobile Phone Numbers
    MOBILE_REGEX = re.compile(
        r'(?:\+?91[\s-]?)?(?:\b[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b|\b0[6-9]\d{9}\b)',
        re.IGNORECASE
    )
    PHONE_MENTION_REGEX = re.compile(
        r'\b(?:phone|mobile|cell|whatsapp|contact|call\s*me)\b(?:\s*(?:is|:|is:|=|to|at|on|no|number|-)?\s*)?[0-9\s-]{10,14}\b',
        re.IGNORECASE
    )

    # 2. Aadhaar Numbers (12-digit patterns and explicit mentions)
    AADHAAR_REGEX = re.compile(r'\b[2-9]{1}[0-9]{3}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b')
    AADHAAR_MENTION_REGEX = re.compile(
        r'\b(?:aadhaar|aadhar|uidai|adhaar)\b(?:\s*(?:is|:|is:|=|to|no|number|num|-)?\s*)?[0-9\s-]{10,16}\b',
        re.IGNORECASE
    )

    # 3. PAN Card Numbers
    PAN_REGEX = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', re.IGNORECASE)
    PAN_MENTION_REGEX = re.compile(
        r'\b(?:pan|pancard|pan\s*card)\b(?:\s*(?:is|:|is:|=|to|no|number|num|-)?\s*)?[A-Z0-9]{8,12}\b',
        re.IGNORECASE
    )

    # 4. Bank Account, IFSC, Cards, CVV, UPI
    BANK_ACCOUNT_REGEX = re.compile(
        r'\b(?:bank|account|acct|account[\s-]?no|account[\s-]?number|a/c|a/c[\s-]?no|bank[\s-]?account|sbi|hdfc|icici|axis|pnb|canara|iob|bob)\b\s*[:#]??\s*[\d]{9,18}\b',
        re.IGNORECASE
    )
    IFSC_REGEX = re.compile(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', re.IGNORECASE)
    IFSC_MENTION_REGEX = re.compile(
        r'\b(?:ifsc|ifsc\s*code)\b(?:\s*(?:is|:|is:|=|to|-)?\s*)?[A-Z0-9]{9,12}\b',
        re.IGNORECASE
    )
    CARD_NUMBER_REGEX = re.compile(
        r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})\b'
    )
    CVV_REGEX = re.compile(r'\b(?:cvv|cvv2|security[\s-]?code)\s*[:#]?\s*[\d]{3,4}\b', re.IGNORECASE)
    OTP_REGEX = re.compile(
        r'\b(?:otp|one[\s-]?time[\s-]?password|verification[\s-]?code|secret[\s-]?code)\b(?:\s*(?:is|:|is:|=|to|for)?\s*[\d]{4,8})?',
        re.IGNORECASE
    )
    UPI_PIN_REGEX = re.compile(
        r'\b(?:upi[\s-]?pin|atm[\s-]?pin|google[\s-]?pay[\s-]?pin|phonepe[\s-]?pin|paytm[\s-]?pin|enter[\s-]?pin|share[\s-]?pin)\b',
        re.IGNORECASE
    )
    PASSWORD_HARVEST_REGEX = re.compile(
        r'\b(?:send|share|give|tell)\s+(?:me\s+)?(?:your\s+)?(?:password|netbanking\s+password|login\s+pin)\b',
        re.IGNORECASE
    )

    # 5. Physical Address & Pincode
    ADDRESS_REGEX = re.compile(
        r'\b(?:flat|door|house|plot|apartment|h\.?no|d\.?no|flat\s*no|door\s*no|house\s*no|residence)\s*[:#\s]?\s*[\w\d\-\/,\s]{2,40}(?:street|road|nagar|layout|colony|cross|main|lane|avenue|salai|enclave)\b',
        re.IGNORECASE
    )
    PINCODE_REGEX = re.compile(
        r'\b(?:pincode|pin\s*code|postal\s*code|pin)\b(?:\s*(?:is|:|is:|=|to|code|-)?\s*)?[1-9][0-9]{2}\s?[0-9]{3}\b',
        re.IGNORECASE
    )

    # 6. Threat, Harassment & Intimidation Words
    THREAT_REGEX = re.compile(
        r'\b(?:kill|blackmail|harm|police\s+complaint|arrest|court\s+notice|fraudster|scammer|extortion|die|abuse|sue\s+you|send\s+goons|threaten|harass|illegal)\b',
        re.IGNORECASE
    )

    # 7. Advance Fee & Scam Triggers
    EXTORTION_LURES = [
        "send money to claim job",
        "pay advance registration fee to receive salary",
        "transfer money to confirm interview",
        "click here to double your money",
        "scan qr code to receive money",
        "enter upi pin to receive payment"
    ]

    SUSPICIOUS_LINKS = re.compile(
        r'https?://(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|[\w-]+\.(?:xyz|top|work|click|loan|mom|gq|cf))[\w/.~-]*',
        re.IGNORECASE
    )

    @classmethod
    def scan_message(cls, content: str) -> Dict[str, Any]:
        """
        Scans message content for phishing, identity harvesting, financial data, and threat words.
        Returns safety verdict, sanitized content, and safety advisories.
        """
        text = content.strip()
        threats_found = []

        # Check Mobile Phone Numbers
        if cls.MOBILE_REGEX.search(text) or cls.PHONE_MENTION_REGEX.search(text):
            threats_found.append("Mobile Phone Number")

        # Check Aadhaar & PAN Card Harvesting
        if cls.AADHAAR_REGEX.search(text) or cls.AADHAAR_MENTION_REGEX.search(text):
            threats_found.append("Aadhaar Number Exposure")
        if cls.PAN_REGEX.search(text) or cls.PAN_MENTION_REGEX.search(text):
            threats_found.append("PAN Card Number Exposure")

        # Check OTP / 2FA Phishing
        if cls.OTP_REGEX.search(text):
            threats_found.append("OTP / Security Code Request")

        # Check UPI / ATM PIN
        if cls.UPI_PIN_REGEX.search(text):
            threats_found.append("UPI / ATM PIN Request")

        # Check Bank Account & IFSC
        if cls.BANK_ACCOUNT_REGEX.search(text) or cls.IFSC_REGEX.search(text) or cls.IFSC_MENTION_REGEX.search(text):
            threats_found.append("Bank Account / IFSC Data")

        # Check Credit/Debit Card & CVV
        if cls.CARD_NUMBER_REGEX.search(text) or cls.CVV_REGEX.search(text):
            threats_found.append("Credit/Debit Card or CVV Information")

        # Check Physical Address & Pincode
        if cls.ADDRESS_REGEX.search(text) or cls.PINCODE_REGEX.search(text):
            threats_found.append("Personal Home Address / Pincode Exposure")

        # Check Threat Words
        if cls.THREAT_REGEX.search(text):
            threats_found.append("Hostile / Threatening Terminology")

        # Check Password Requests
        if cls.PASSWORD_HARVEST_REGEX.search(text):
            threats_found.append("Password / Account Login Harvesting")

        # Check Extortion Lures
        text_lower = text.lower()
        for lure in cls.EXTORTION_LURES:
            if lure in text_lower:
                threats_found.append("Advance Fee / Fake Payment Lure")
                break

        # Check Suspicious Phishing URL Shorteners
        if cls.SUSPICIOUS_LINKS.search(text):
            threats_found.append("Suspicious / Unverified External Link")

        # If any threat is detected
        if threats_found:
            sanitized = text
            sanitized = cls.MOBILE_REGEX.sub("[REDACTED PHONE NUMBER]", sanitized)
            sanitized = cls.PHONE_MENTION_REGEX.sub("[REDACTED PHONE NUMBER]", sanitized)
            sanitized = cls.AADHAAR_REGEX.sub("[REDACTED AADHAAR]", sanitized)
            sanitized = cls.AADHAAR_MENTION_REGEX.sub("[REDACTED AADHAAR]", sanitized)
            sanitized = cls.PAN_REGEX.sub("[REDACTED PAN]", sanitized)
            sanitized = cls.PAN_MENTION_REGEX.sub("[REDACTED PAN]", sanitized)
            sanitized = cls.OTP_REGEX.sub("[REDACTED OTP/PIN]", sanitized)
            sanitized = cls.UPI_PIN_REGEX.sub("[REDACTED PIN REQUEST]", sanitized)
            sanitized = cls.BANK_ACCOUNT_REGEX.sub("[REDACTED BANK ACCOUNT]", sanitized)
            sanitized = cls.IFSC_REGEX.sub("[REDACTED IFSC]", sanitized)
            sanitized = cls.IFSC_MENTION_REGEX.sub("[REDACTED IFSC]", sanitized)
            sanitized = cls.CARD_NUMBER_REGEX.sub("[REDACTED CARD NUMBER]", sanitized)
            sanitized = cls.CVV_REGEX.sub("[REDACTED CVV]", sanitized)
            sanitized = cls.ADDRESS_REGEX.sub("[REDACTED RESIDENTIAL ADDRESS]", sanitized)
            sanitized = cls.PINCODE_REGEX.sub("[REDACTED PINCODE]", sanitized)
            sanitized = cls.THREAT_REGEX.sub("[REDACTED INAPPROPRIATE/THREAT WORD]", sanitized)
            sanitized = cls.SUSPICIOUS_LINKS.sub("[REDACTED SUSPICIOUS LINK]", sanitized)

            warning_msg = (
                f"🛡️ Safety Advisory: SilverHands flagged this message ({', '.join(threats_found)}). "
                "For elder safety, never share mobile numbers, addresses, Aadhaar, PAN, OTPs, or bank details."
            )

            return {
                "is_safe": False,
                "is_flagged": True,
                "threats": threats_found,
                "sanitized_content": sanitized,
                "warning_message": warning_msg
            }

        return {
            "is_safe": True,
            "is_flagged": False,
            "threats": [],
            "sanitized_content": text,
            "warning_message": None
        }

chat_safety_filter = ChatSafetyFilter()
