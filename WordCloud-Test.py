import numpy as np
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from PIL import Image, ImageDraw
import streamlit as st
import io
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

st.set_page_config(
    page_title="Word Cloud Shape Test",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS to improve the appearance
st.markdown("""
<style>
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    .stApp {
        max-width: 100%;
    }
    h1, h2, h3 {
        margin-bottom: 1rem;
    }
    .stButton button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

st.title("Word Cloud Shape Generator Test")
st.write("This is a test application for generating word clouds with custom shapes and rainbow colors.")

# Sidebar for customization
with st.sidebar:
    st.header("Customization Options")
    
    # Color options
    color_option = st.selectbox(
        "Color Scheme",
        ["rainbow", "viridis", "plasma", "inferno", "magma", "cividis"]
    )
    
    # Shape options
    shape_option = st.selectbox(
        "Shape",
        ["Cloud", "Circle", "Rectangle", "Heart"]
    )
    
    # Size options
    width = st.slider("Width", 400, 1200, 800)
    height = st.slider("Height", 300, 800, 500)
    
    # Background color
    bg_color = st.color_picker("Background Color", "#FFFFFF")
    
    # Max words
    max_words = st.slider("Maximum Words", 50, 500, 200)

# Text input area
st.subheader("Enter Text for Word Cloud")
default_text = """CoreWeave's upcoming IPO has generated significant interest, particularly given its rapid growth, high-profile partnerships, and strategic position in the AI infrastructure market. However, whether it's a worthwhile investment depends on several factors:

Pros of Investing in CoreWeave
Explosive Growth in AI Demand
The company's revenue jumped from $16 million in 2022 to $1.9 billion in 2024, reflecting massive demand for AI infrastructure. AI workloads, including training large language models (LLMs) like OpenAI's GPT models, require extensive GPU computing, and CoreWeave has positioned itself as a major cloud provider.

Strong Partnerships & Contracts
$11.9 billion contract with OpenAI (March 2025), reinforcing its long-term demand.
Clients include Microsoft, Meta, IBM, and Nvidia—all major players in AI and cloud computing.
Nvidia owns a 6% stake, which signals confidence from the leading GPU supplier.

IPO Valuation & Market Position
Expected valuation of $35 billion, positioning it as a top AI cloud provider.
Direct competition with AWS, Google Cloud, and Microsoft Azure, but uniquely focused on AI-specific workloads.
Riding the AI wave—as AI demand grows, so does the need for GPU cloud computing.

Risks & Concerns
High Operating Losses & Capital-Intensive Model
$863 million net loss in 2024, primarily due to heavy investment in data centers and GPUs.
AI cloud infrastructure is highly capital-intensive, requiring constant reinvestment in hardware.

Competition from Big Tech
Amazon, Google, and Microsoft are expanding their own AI infrastructure.
If OpenAI or other major clients build in-house solutions, CoreWeave could lose business.

IPO Pricing & Market Volatility
AI stocks have been volatile—if the IPO is overhyped, early investors might face a price correction.
How the market values the IPO (P/S ratio, earnings potential) will be crucial in determining if it's a good buy.

Investment Outlook: Buy, Watch, or Avoid?
If you're bullish on AI infrastructure and GPU cloud computing, CoreWeave could be a strong long-term play.
If you prefer companies with profitability and lower risk, waiting until it proves financial sustainability might be smarter.
If the IPO is overvalued, early investors could see short-term losses before long-term gains."""

text_input = st.text_area("Text", default_text, height=300)

# Function to create different shape masks
def create_shape_mask(shape, width, height):
    mask = Image.new("L", (width, height), 255)  # White background
    draw = ImageDraw.Draw(mask)
    
    if shape == "Cloud":
        # Draw a cloud-like shape
        center_x, center_y = width // 2, height // 2
        radius_x, radius_y = width // 2 - 50, height // 2 - 50
        
        # Main ellipse
        draw.ellipse([center_x - radius_x, center_y - radius_y, 
                      center_x + radius_x, center_y + radius_y], fill=0)
        
        # Additional bumps to make it cloud-like
        draw.ellipse([center_x - radius_x//2, center_y - radius_y - 30, 
                      center_x + radius_x//2, center_y - radius_y//2], fill=0)
        
        draw.ellipse([center_x + radius_x//2, center_y - radius_y//2, 
                      center_x + radius_x + 30, center_y + radius_y//2], fill=0)
        
        draw.ellipse([center_x - radius_x - 30, center_y - radius_y//2, 
                      center_x - radius_x//2, center_y + radius_y//2], fill=0)
        
    elif shape == "Circle":
        # Simple circle
        padding = 50
        draw.ellipse([padding, padding, width - padding, height - padding], fill=0)
        
    elif shape == "Rectangle":
        # Rectangle with rounded corners
        padding = 50
        draw.rectangle([padding, padding, width - padding, height - padding], fill=0)
        
    elif shape == "Heart":
        # Heart shape
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 2 - 50
        
        # Create a heart shape
        # Top left circle
        draw.ellipse([center_x - size, center_y - size//2, 
                      center_x, center_y + size//2], fill=0)
        
        # Top right circle
        draw.ellipse([center_x, center_y - size//2, 
                      center_x + size, center_y + size//2], fill=0)
        
        # Bottom triangle
        points = [
            (center_x - size, center_y), 
            (center_x, center_y + size), 
            (center_x + size, center_y)
        ]
        draw.polygon(points, fill=0)
    
    return np.array(mask)

# Generate button
if st.button("Generate Word Cloud"):
    if text_input:
        # Create the mask based on selected shape
        mask = create_shape_mask(shape_option, width, height)
        
        # Generate the word cloud
        wordcloud = WordCloud(
            width=width, 
            height=height, 
            colormap=color_option, 
            background_color=bg_color,
            max_words=max_words,
            mask=mask
        ).generate(text_input)
        
        # Create a matplotlib figure
        fig = plt.figure(figsize=(width/100, height/100))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis("off")
        
        # Convert the figure to an image
        buf = io.BytesIO()
        canvas = FigureCanvas(fig)
        canvas.print_png(buf)
        plt.close(fig)
        
        # Display the word cloud
        st.image(buf, caption=f"{shape_option} Word Cloud with {color_option} colors", use_column_width=True)
        
        # Add download button
        buf.seek(0)
        st.download_button(
            label="Download Word Cloud",
            data=buf,
            file_name=f"wordcloud_{shape_option.lower()}_{color_option}.png",
            mime="image/png"
        )
    else:
        st.error("Please enter some text to generate a word cloud.")

# Add information about the test
st.markdown("---")
st.subheader("About This Test")
st.write("""
This standalone test application demonstrates how to create word clouds with custom shapes and rainbow color palettes.
It uses the WordCloud library with mask functionality to constrain the words to specific shapes.

Key features being tested:
- Custom shape masks (cloud, circle, rectangle, heart)
- Rainbow and other color palettes
- Size customization
- Background color options
- Maximum word count control
- Image download functionality
""")
