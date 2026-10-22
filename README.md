# 🌾 Smart Agriculture and Irrigation Advisory System

An interactive IoT simulation and advisory dashboard that simulates real-time soil moisture, ambient temperature, and humidity sensors to drive intelligent automated irrigation and water conservation.

---

## 🚀 Key Features

- **Real-Time IoT Simulation:** Simulates soil moisture (FC-28 / YL-69), temperature & humidity (DHT11), and automated pump relay switching.
- **Smart vs. Traditional Comparison:** Live analytics comparing sensor-driven automated irrigation against conventional fixed-timer schedules, highlighting water savings and over-watering prevention.
- **Advisory Engine:** Crop-specific threshold alerts (Wheat, Rice, Cotton, Sugarcane, Tomato, Soybean) with automated recommendations.
- **Interactive Controls:**
  - Pause / Play simulation clock (1×, 2×, 5×, 10× speed).
  - Mode switching (Automatic vs. Manual pump control).
  - Weather simulation triggers (Rainfall, Heatwave, Tank refilling).
- **Live CCTV Simulation:** Simulated crop field camera view with day/night and weather cycles.
- **Hardware Architecture & Wiring Diagram:** Interactive schematic depicting Arduino Uno, LM393 comparator, relay module, 12V submersible pump, and pinout connections.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI & Visualization:** React, HTML5, Inline SVG Diagrams, Vanilla CSS
- **Deployment Target:** [Vercel](https://vercel.com/)

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/geetakadam275/-Smart-Agriculture-and-Irrigation-Advisory-System.git
   cd -Smart-Agriculture-and-Irrigation-Advisory-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## ☁️ Deployment Guide (Vercel)

This project is optimized for 1-click deployment on **Vercel**:

1. Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select this repository: `-Smart-Agriculture-and-Irrigation-Advisory-System`.
4. Keep the default settings (Framework preset: **Next.js**, Root directory: `./`).
5. Click **Deploy**.

Vercel will build and publish your application with a live HTTPS URL (e.g. `https://smart-agriculture-xxx.vercel.app`) and automatically deploy updates on every `git push`.

---

## 👥 Authors
- Gita Kadam
- Asmita Raut
- Keshav Rajurkar
- Vaibhav Nandedkar
