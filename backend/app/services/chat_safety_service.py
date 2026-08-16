import re
from typing import Dict, Any, Optional

class ChatSafetyFilter:
    """
    Robust NLP & Pattern-based Senior Fraud & Phishing Protection Filter.
    Detects attempts to harvest sensitive financial details (OTP, UPI PIN, Bank Accounts,
    Cards, CVV) or personal identification (Aadhaar, PAN, Passwords).
    """

    # 1. Financial & Authentication Phishing Patterns
    OTP_REGEX = re.compile(
        r'\b(?:otp|one[\s-]?time[\s-]?password|verification[\s-]?code|secret[\s-]?code)\b(?:\s*(?:is|:|is:|=|to|for)?\s*[\d]{4,8})?',
        re.IGNORECASE
    )
    UPI_PIN_REGEX = re.compile(
        r'\b(?:upi[\s-]?pin|atm[\s-]?pin|google[\s-]?pay[\s-]?pin|phonepe[\s-]?pin|paytm[\s-]?pin|enter[\s-]?pin|share[\s-]?pin)\b',
        re.IGNORECASE
    )
    BANK_ACCOUNT_REGEX = re.compile(
        r'\b(?:acct|account[\s-]?no|account[\s-]?number|a/c[\s-]?no)\b\s*[:#]?\s*[\d]{9,18}\b',
        re.IGNORECASE
    )
    IFSC_REGEX = re.compile(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', re.IGNORECASE)
    CARD_NUMBER_REGEX = re.compile(
        r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})\b'
    )
    CVV_REGEX = re.compile(r'\b(?:cvv|cvv2|security[\s-]?code)\s*[:#]?\s*[\d]{3,4}\b', re.IGNORECASE)

    # 2. Sensitive Personal Identity Patterns
    AADHAAR_REGEX = re.compile(r'\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b')
    PAN_REGEX = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', re.IGNORECASE)
    PASSWORD_HARVEST_REGEX = re.compile(
        r'\b(?:send|share|give|tell)\s+(?:me\s+)?(?:your\s+)?(?:password|netbanking\s+password|login\s+pin)\b',
        re.IGNORECASE
    )

    # 3. Advance Fee & Money Extortion Scam Triggers
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
        Scans message content for phishing and financial scam threats.
        Returns safety verdict, sanitized content, and safety advisories.
        """
        text = content.strip()
        threats_found = []
        warning_msg = None

        # Check OTP / 2FA Phishing
        if cls.OTP_REGEX.search(text):
            threats_found.append("OTP / Security Code Request")

        # Check UPI / ATM PIN
        if cls.UPI_PIN_REGEX.search(text):
            threats_found.append("UPI / ATM PIN Request")

        # Check Bank Account & IFSC
        if cls.BANK_ACCOUNT_REGEX.search(text) or (cls.IFSC_REGEX.search(text) and re.search(r'\d{8,}', text)):
            threats_found.append("Direct Bank Account / IFSC Data Request")

        # Check Credit/Debit Card & CVV
        if cls.CARD_NUMBER_REGEX.search(text) or cls.CVV_REGEX.search(text):
            threats_found.append("Credit/Debit Card or CVV Information")

        # Check Aadhaar & PAN Card Harvesting
        if cls.AADHAAR_REGEX.search(text) or cls.PAN_REGEX.search(text):
            threats_found.append("Aadhaar or PAN Card Number Exposure")

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
            # Redact detected sensitive sequences for safety
            sanitized = cls.OTP_REGEX.sub("[REDACTED OTP/PIN]", sanitized)
            sanitized = cls.UPI_PIN_REGEX.sub("[REDACTED PIN REQUEST]", sanitized)
            sanitized = cls.BANK_ACCOUNT_REGEX.sub("[REDACTED BANK ACCOUNT]", sanitized)
            sanitized = cls.IFSC_REGEX.sub("[REDACTED IFSC]", sanitized)
            sanitized = cls.CARD_NUMBER_REGEX.sub("[REDACTED CARD NUMBER]", sanitized)
            sanitized = cls.CVV_REGEX.sub("[REDACTED CVV]", sanitized)
            sanitized = cls.AADHAAR_REGEX.sub("[REDACTED AADHAAR]", sanitized)
            sanitized = cls.PAN_REGEX.sub("[REDACTED PAN]", sanitized)
            sanitized = cls.SUSPICIOUS_LINKS.sub("[REDACTED SUSPICIOUS LINK]", sanitized)

            warning_msg = (
                f"🛡️ Safety Advisory: SilverHands flagged this message ({', '.join(threats_found)}). "
                "Never share OTPs, UPI PINs, passwords, or bank details. SilverHands staff will never ask for your PIN or OTP."
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
