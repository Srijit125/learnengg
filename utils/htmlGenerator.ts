export interface Block {
  id: string;
  type:
    | "paragraph"
    | "bullets"
    | "numbers"
    | "table"
    | "formula"
    | "image"
    | "video";
  content: any;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  video: string;
  blocks: Block[];
}

export class HTMLGenerator {
  static escape(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static p(text: string): string {
    return `<li class="big-bullet">${this.escape(text)}</li>`;
  }

  static sectionHeader(
    text: string,
    video: string,
    modalId: number | string,
  ): string {
    if (!text) return "";
    if (!video) {
      return `<h2 class="section-header">${this.escape(text)}</h2>`;
    }
    return `<h2 class="section-header">${this.escape(text)} <button class="video-btn" data-video-src="${video}" id="open-modal-btn-${modalId}">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#0073e6" style="vertical-align: middle">
        <path d="M17 10.5V7c0-1.1-.9-2-2-2H3C1.9 5 1 5.9 1 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3.5l5 5v-13l-5 5z" />
      </svg>
    </button></h2>`;
  }

  static subsectionHeader(text: string): string {
    return `<h3>${this.escape(text)}</h3>`;
  }

  static bulletList(items: any[]): string {
    const render = (nodes: any[]): string => {
      let html = "<ul>";
      for (const n of nodes) {
        html += `<li>${this.escape(n.text)}`;
        if (n.children && n.children.length > 0) {
          html += render(n.children);
        }
        html += "</li>";
      }
      html += "</ul>";
      return html;
    };
    return render(items);
  }

  static numberedList(items: string[]): string {
    const listItems = items
      .map((item) => `<li>${this.escape(item)}</li>`)
      .join("");
    return `<ol>${listItems}</ol>`;
  }

  static tableFromMatrix(matrix: string[][]): string {
    if (!matrix || matrix.length === 0) return "<table></table>";
    const header = matrix[0]
      .map((cell) => `<th>${this.escape(cell)}</th>`)
      .join("");
    let rows = "";
    for (let i = 1; i < matrix.length; i++) {
      const rowHtml = matrix[i]
        .map((cell) => `<td>${this.escape(cell)}</td>`)
        .join("");
      rows += `<tr>${rowHtml}</tr>`;
    }
    return `<table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  static formulaLatex(latexCode: string): string {
    return `<div class="math-block">
      $${latexCode}$$
    </div>`;
  }

  static img(src: string, caption?: string): string {
    const captionHtml = caption
      ? `<figcaption>${this.escape(caption)}</figcaption>`
      : "";
    return `<figure>
      <img src="${src}" alt="${caption ? this.escape(caption) : "image"}"/>
      ${captionHtml}
    </figure>`;
  }

  static video(src: string): string {
    return `<video controls style="width: 100%; max-width: 600px; margin: 10px 0;">
      <source src="${src}" type="video/mp4">
      Your browser does not support the video tag.
    </video>`;
  }

  static assembleHtml(title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.escape(title)}</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            line-height: 1.6;
        }
        section.notes-section {
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
        }
        figure {
            text-align: center;
            margin: 10px 0;
        }
        img {
            max-width: 80%;
            height: auto;
        }
        table {
            border-collapse: collapse;
            margin: 10px 0;
        }
        table, td, th {
            border: 1px solid #333;
            padding: 5px 10px;
        }
        .title-bar {
            background: #0a8a83;
            color: white;
            padding: 14px 20px;
            font-size:26px;
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: 25px;
        }
        .section-header {
            background: #8a630a;
            color: white;
            padding: 10px 10px;
            font-size:22px;
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: 25px;
        }
        .modal {
            display: none; 
            position: fixed; 
            z-index: 1; 
            left: 0;
            top: 0;
            width: 100%; 
            height: 100%; 
            background-color: rgba(0,0,0,0.7); 
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            background-color: #fefefe;
            margin: auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%; 
            max-width: 720px;
            position: relative;
        }
        .video-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 18px;
        }
         .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        #modalVideo {
            width: 100%;
            height: auto; 
        }
        .big-bullet {
          list-style: none;
          position: relative;
          padding-left: 28px;
        }
        .big-bullet::before {
          content: "";
          width: 9px;
          height: 9px;
          background: black;
          border-radius: 20%;
          position: absolute;
          left: 0;
          top: 6px;
        }
        ul { margin-left:0px; }
        ul ul { margin-left:0px; list-style-type: circle; }
        ul ul ul { margin-left:0px; list-style-type: square; }
    </style>
</head>
<body>
    <h1 class="title-bar">${this.escape(title)}</h1>
    ${bodyContent}
    <div id="videoModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <video id="modalVideo" controls controlsList="nodownload noplaybackrate" disablePictureInPicture>
                <source src="" type="video/mp4">
            </video>
        </div>
    </div>
    <script>
        const modal = document.getElementById("videoModal");
        const video = document.getElementById("modalVideo");
        const closeBtn = document.querySelector(".close");

        document.addEventListener("click", function(e) {
            const btn = e.target.closest(".video-btn");
            if (!btn) return;
            const src = btn.dataset.videoSrc;
            video.src = src;
            modal.style.display = "flex";
            video.play();
        });

        closeBtn.onclick = () => {
            modal.style.display = "none";
            video.pause();
            video.src = "";
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
                video.pause();
                video.src = "";
            }
        };
    </script>
</body>
</html>`;
  }
}
