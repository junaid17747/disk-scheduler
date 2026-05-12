# 💿 Disk Scheduling Visualizer & Seek Time Analyzer

An interactive web application that visualizes six classic disk scheduling algorithms used in Operating Systems. Watch the read/write head move across disk cylinders in real time, compare seek times, and analyze algorithm performance side by side.

![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-4.4-646cff?style=flat-square&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🌐 Live Demo

👉 **[disk-scheduler.vercel.app](https://disk-scheduler-ten.vercel.app/)**

---

## 📸 Preview

| Visualize Tab | Compare Tab |
|---|---|
| Animated disk head movement | Side-by-side seek time comparison |
| Step-by-step seek pattern chart | Bar chart with best algorithm badge |
| Service order with highlights | Algorithm reference notes |

---

## ✨ Features

- 🎬 **Animated Disk Track** — Watch the read/write head glide across cylinders with smooth transitions
- 📊 **Seek Pattern Chart** — SVG line graph showing cylinder vs step for every move the head makes
- 🏷️ **Cylinder Labels** — Live labels below the track showing every stop the head visits
- ⏯️ **Playback Controls** — Play, Pause, Step Forward, Step Back, Skip to Start/End
- 📉 **Compare All** — Run all 6 algorithms on the same input and compare seek times instantly
- 🎲 **Randomize** — Generate random request queues for quick demos
- 🏆 **Best Algorithm Badge** — Automatically highlights the most efficient algorithm

---

## 🧮 Algorithms Implemented

| Algorithm | Full Name | Key Characteristic |
|---|---|---|
| **FCFS** | First Come First Serve | Services in arrival order |
| **SSTF** | Shortest Seek Time First | Always picks nearest request |
| **SCAN** | Elevator Algorithm | Sweeps end to end |
| **C-SCAN** | Circular SCAN | One direction only, jumps back |
| **LOOK** | LOOK | Reverses at last request |
| **C-LOOK** | Circular LOOK | Circular + stops at last request |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v20 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/disk-scheduler.git

# 2. Navigate into the project
cd disk-scheduler

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 📁 Project Structure

```
disk-scheduler/
├── index.html          # HTML entry point
├── package.json        # Project config and dependencies
├── vite.config.js      # Vite build configuration
└── src/
    ├── main.jsx        # React DOM render entry
    └── App.jsx         # Main application (all components)
```

---

## 🏗️ System Architecture

```
User Interface
    ↓
Input Parser & Validator
    ↓
Scheduling Engine (FCFS · SSTF · SCAN · C-SCAN · LOOK · C-LOOK)
    ↓
Results & Metrics (Seek Path · Total Seek Time · Service Order)
    ↙           ↘
Disk Track     Seek Chart
Animation      (Line Graph)
    ↘           ↙
  Comparison Module
(Bar Chart · Summary Table)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite 4 | Build tool and dev server |
| SVG (custom) | Seek pattern chart and animations |
| CSS-in-JS | Inline styles for dynamic theming |

---

## 📊 How to Use

1. **Enter a request queue** — type cylinder numbers separated by commas (e.g. `98, 183, 37, 122, 14, 124, 65, 67`)
2. **Set head position** — enter the starting cylinder (e.g. `53`)
3. **Select an algorithm** — click any of the 6 algorithm buttons
4. **Click Run** — results appear instantly
5. **Click Play** — watch the head animate across the disk track
6. **Switch to Compare tab** — see all algorithms ranked by seek time

---

## 📐 Sample Test Case

| Input | Value |
|---|---|
| Request Queue | `98, 183, 37, 122, 14, 124, 65, 67` |
| Head Position | `53` |
| Disk Size | `200 cylinders` |

| Algorithm | Total Seek Time |
|---|---|
| FCFS | 640 |
| SSTF | 236 ✅ Best |
| SCAN | 331 |
| C-SCAN | 382 |
| LOOK | 299 |
| C-LOOK | 322 |

---

## 🚢 Deployment

### Deploy on Vercel
```bash
# Push to GitHub first, then:
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Vercel auto-detects Vite
# 4. Click Deploy
```

### Deploy on Firebase
```bash
npm run build
firebase init    # select Hosting, set public dir to dist
firebase deploy
```

---

## 🔮 Future Enhancements

- [ ] Add rotational latency and transfer time simulation
- [ ] Support dynamic (real-time) request arrival
- [ ] Export seek chart as PNG or PDF
- [ ] Add N-Step SCAN and FSCAN algorithms
- [ ] Dark / Light theme toggle

---

## 📚 References

- Silberschatz, Galvin, Gagne — *Operating System Concepts* (10th ed.), Chapter 10
- Tanenbaum — *Modern Operating Systems* (4th ed.)
- [GeeksForGeeks — Disk Scheduling Algorithms](https://www.geeksforgeeks.org/disk-scheduling-algorithms/)
- [OS: Three Easy Pieces](https://ostep.org)

---

## 👨‍💻 Author

Made as part of the **Operating Systems Laboratory Mini Project**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
