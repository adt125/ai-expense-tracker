"""Shared constants for agent categories and related helpers."""

CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Utilities",
    "Entertainment",
    "Health",
    "Finance",
    "Travel",
    "Education",
    "Income",
    "Transfer",
    "Other",
]

# Human-friendly block for embedding into prompts
CATEGORIES_PROMPT = "\n".join(
    [
        "- Food & Dining (subcategories: Restaurants, Food Delivery, Groceries, Cafes)",
        "- Transport (subcategories: Cab, Metro/Bus, Fuel, Auto)",
        "- Shopping (subcategories: Clothing, Electronics, Amazon/Flipkart, General)",
        "- Utilities (subcategories: Electricity, Water, Internet, Mobile Recharge)",
        "- Entertainment (subcategories: OTT/Streaming, Movies, Events, Gaming)",
        "- Health (subcategories: Pharmacy, Hospital, Lab Tests, Gym)",
        "- Finance (subcategories: EMI, Insurance, Investments, Bank Charges)",
        "- Travel (subcategories: Flights, Hotels, Trains)",
        "- Education (subcategories: Courses, Books, Subscriptions)",
        "- Income (subcategories: Salary, Freelance, Cashback, Refund)",
        "- Transfer (subcategories: UPI Transfer, NEFT, Internal Transfer)",
        "- Other",
    ]
)
