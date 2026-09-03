/**
 * Smart Soal Parser - TypeScript Version
 * Port from Python converter_v2.py with enhancements
 * Mobile-optimized untuk UpdatePTN Platform
 */

// Format JSON sesuai dengan Python tools di New folder
export interface Question {
  subtest: string;
  text: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E' | '';
  explanation: string;
}

// Internal interface untuk parsing (dengan nomor)
interface QuestionInternal extends Question {
  nomor: number;
}

export interface ParseResult {
  questions: Question[];
  errors: string[];
  stats: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    hasIncompleteOptions: number;
  };
}

interface KunciJawaban {
  jawaban: string;
  pembahasan: string;
}

/**
 * Smart Parser untuk konversi soal text ke JSON
 */
export class SmartSoalParser {
  private debug = false;

  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * Main parsing function
   */
  parse(rawText: string, kunciText: string): ParseResult {
    const errors: string[] = [];
    const questions: QuestionInternal[] = [];

    try {
      // Step 1: Split soal blocks
      const soalBlocks = this.splitSoalBlocks(rawText);

      // Step 2: Parse kunci jawaban
      const kunciDict = this.parseKunciJawaban(kunciText);

      // Step 3: Parse setiap soal
      let successCount = 0;
      let hasIncompleteOptions = 0;

      for (const [nomor, content] of soalBlocks) {
        try {
          const soalData = this.parseSoalBlock(nomor, content, kunciDict);
          if (soalData) {
            questions.push(soalData);
            successCount++;

            // Check if options incomplete
            if (!soalData.option_e || soalData.option_e === '(E) ') {
              hasIncompleteOptions++;
            }
          }
        } catch (err) {
          const errorMsg = `Soal ${nomor}: ${err instanceof Error ? err.message : 'Parse error'}`;
          errors.push(errorMsg);
          if (this.debug) console.error(errorMsg);
        }
      }

      // Step 4: Resolve references
      const resolvedQuestions = this.resolveReferences(questions);

      // Step 5: Remove nomor field for final output (sesuai format Python)
      const finalQuestions: Question[] = resolvedQuestions.map(({ nomor, ...rest }) => rest);

      return {
        questions: finalQuestions,
        errors,
        stats: {
          totalProcessed: soalBlocks.length,
          successCount,
          errorCount: errors.length,
          hasIncompleteOptions,
        },
      };
    } catch (err) {
      errors.push(`Fatal error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return {
        questions: [],
        errors,
        stats: {
          totalProcessed: 0,
          successCount: 0,
          errorCount: 1,
          hasIncompleteOptions: 0,
        },
      };
    }
  }

  /**
   * Split text menjadi blok-blok soal
   * Supports:
   * 1. Individual format: "Soal 1", "Soal 2", etc
   * 2. Range format: "Soal 1 - 5 Teks 1" (literasi dengan teks bacaan)
   * 3. Direct numbering: "1.", "2.", "3." (standard format)
   */
  private splitSoalBlocks(text: string): Array<[number, string]> {
    const blocks: Array<[number, string]> = [];

    // Check for range format first (Soal X - Y Teks Z)
    const rangePattern = /(?:^|\n)\s*Soal\s+(\d+)\s*-\s*(\d+)\s+Teks\s+\d+/gi;
    const rangeMatches = Array.from(text.matchAll(rangePattern));

    if (rangeMatches.length > 0) {
      // Handle literasi format with shared text passages
      return this.splitLiterasiBlocks(text);
    }

    // Check for "Soal N" format
    const soalPattern = /(?:^|\n)\s*Soal\s+(\d+)(?!\s*-)/gi;
    const soalMatches = Array.from(text.matchAll(soalPattern));

    if (soalMatches.length > 0) {
      // Handle "Soal 1", "Soal 2" format
      for (let i = 0; i < soalMatches.length; i++) {
        const match = soalMatches[i];
        const nomor = parseInt(match[1], 10);
        const start = match.index! + match[0].length;

        // End position: next soal or end of text
        const end = i + 1 < soalMatches.length ? soalMatches[i + 1].index! : text.length;

        const content = text.slice(start, end).trim();
        blocks.push([nomor, content]);
      }
      return blocks;
    }

    // Handle direct numbering format: "1.", "2.", "3."
    // This is the most common standard format
    return this.splitDirectNumbering(text);
  }

  /**
   * Split text with direct numbering format: "1.", "2.", "3."
   */
  private splitDirectNumbering(text: string): Array<[number, string]> {
    const blocks: Array<[number, string]> = [];

    // Pattern: number + dot at start of line
    // Must be followed by space and text (not just options)
    const pattern = /(?:^|\n)(\d+)\.\s+([A-Z])/gm;
    const matches = Array.from(text.matchAll(pattern));

    if (matches.length === 0) {
      if (this.debug) {
        console.log('No direct numbering format detected');
      }
      return blocks;
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const nomor = parseInt(match[1], 10);
      
      // Start from the number itself (include it in content)
      const start = match.index!;

      // End position: next number or end of text
      let end = text.length;
      
      if (i + 1 < matches.length) {
        end = matches[i + 1].index!;
      }

      let content = text.slice(start, end).trim();
      
      // Remove the leading "N. " from content
      content = content.replace(/^\d+\.\s+/, '');

      blocks.push([nomor, content]);
    }

    if (this.debug) {
      console.log(`Detected ${blocks.length} questions in direct numbering format`);
    }

    return blocks;
  }

  /**
   * Split literasi format with shared text passages
   * Format: "Teks Bacaan 1" followed by "Soal 1 - 5 Teks 1" with individual questions
   */
  private splitLiterasiBlocks(text: string): Array<[number, string]> {
    const blocks: Array<[number, string]> = [];

    // Find all text passages and their associated question ranges
    const sections: Array<{ teks: string; startSoal: number; endSoal: number }> = [];

    // Pattern for "Teks Bacaan N"
    const teksPattern = /(?:^|\n)\s*Teks\s+Bacaan\s+\d+\s*\n/gi;
    const teksMatches = Array.from(text.matchAll(teksPattern));

    for (let i = 0; i < teksMatches.length; i++) {
      const teksMatch = teksMatches[i];
      const teksStart = teksMatch.index! + teksMatch[0].length;

      // Find the "Soal X - Y Teks N" header after this text
      const remainingText = text.slice(teksStart);
      const rangeMatch = remainingText.match(/Soal\s+(\d+)\s*-\s*(\d+)\s+Teks\s+\d+/i);

      if (rangeMatch) {
        const startSoal = parseInt(rangeMatch[1], 10);
        const endSoal = parseInt(rangeMatch[2], 10);
        
        // Extract the text passage (everything before the "Soal X - Y" header)
        const rangeHeaderPos = remainingText.indexOf(rangeMatch[0]);
        const teksContent = remainingText.slice(0, rangeHeaderPos).trim();

        sections.push({
          teks: teksContent,
          startSoal,
          endSoal,
        });
      }
    }

    // Now extract individual questions from each section
    for (const section of sections) {
      if (this.debug) {
        console.log(`Processing section: Soal ${section.startSoal} - ${section.endSoal}`);
      }

      // Extract questions within this range (inclusive)
      for (let soalNum = section.startSoal; soalNum <= section.endSoal; soalNum++) {
        const questionBlock = this.extractQuestionBlock(text, soalNum, section.endSoal);
        
        if (questionBlock) {
          // Prepend the shared text passage
          const fullContent = `${section.teks}\n\n${questionBlock}`;
          blocks.push([soalNum, fullContent]);
          
          if (this.debug) {
            console.log(`✅ Extracted Soal ${soalNum}`);
          }
        } else {
          if (this.debug) {
            console.log(`❌ Failed to extract Soal ${soalNum}`);
          }
        }
      }
    }

    if (this.debug) {
      console.log(`Total questions extracted: ${blocks.length}`);
    }

    return blocks;
  }

  /**
   * Extract a single question block (question + options)
   * Enhanced to handle edge cases
   */
  private extractQuestionBlock(text: string, soalNum: number, maxSoal: number): string | null {
    // Pattern: "N. question text" or just "N." at start of line
    const startPattern = new RegExp(`(?:^|\\n)\\s*${soalNum}\\.\\s+`, 'gm');
    const startMatch = startPattern.exec(text);

    if (!startMatch) {
      // Fallback: try without space after dot
      const altPattern = new RegExp(`(?:^|\\n)\\s*${soalNum}\\.`, 'gm');
      const altMatch = altPattern.exec(text);
      if (!altMatch) return null;
      
      const start = altMatch.index + altMatch[0].length;
      
      // Find end using same logic
      let end = text.length;
      
      // Try to find next question
      for (let nextNum = soalNum + 1; nextNum <= maxSoal + 2; nextNum++) {
        const endPattern = new RegExp(`(?:^|\\n)\\s*${nextNum}\\.`, 'm');
        const endMatch = endPattern.exec(text.slice(start));
        
        if (endMatch) {
          end = start + endMatch.index;
          break;
        }
      }
      
      // Check for next section markers
      const nextSection = text.slice(start).match(/\n\s*(?:Teks\s+Bacaan|Soal\s+\d+\s*-\s*\d+|KUNCI)/);
      if (nextSection && nextSection.index !== undefined && start + nextSection.index < end) {
        end = start + nextSection.index;
      }
      
      return text.slice(start, end).trim();
    }

    const start = startMatch.index + startMatch[0].length;

    // Find end: next question number or end of text
    let end = text.length;
    
    // Try multiple next numbers to be sure we catch the boundary
    for (let nextNum = soalNum + 1; nextNum <= maxSoal + 2; nextNum++) {
      const endPattern = new RegExp(`(?:^|\\n)\\s*${nextNum}\\.\\s*`, 'm');
      const endMatch = endPattern.exec(text.slice(start));
      
      if (endMatch) {
        end = start + endMatch.index;
        break;
      }
    }

    // Also check for next "Teks Bacaan" section or "KUNCI JAWABAN"
    const nextSectionPatterns = [
      /\n\s*Teks\s+Bacaan\s+\d+/,
      /\n\s*Soal\s+\d+\s*-\s*\d+/,
      /\n\s*KUNCI\s+JAWABAN/i,
    ];
    
    for (const pattern of nextSectionPatterns) {
      const nextMatch = text.slice(start).match(pattern);
      if (nextMatch && nextMatch.index !== undefined && start + nextMatch.index < end) {
        end = start + nextMatch.index;
      }
    }

    const content = text.slice(start, end).trim();
    
    // Validation: must have options A-E or at least question text
    if (content.length < 10) return null;
    
    return content;
  }

  /**
   * Parse single soal block
   */
  private parseSoalBlock(
    nomor: number,
    content: string,
    kunciDict: Record<number, KunciJawaban>
  ): QuestionInternal | null {
    // Phase 1: Extract pilihan jawaban (anchor point paling reliable)
    const [pilihanStart, pilihan] = this.extractPilihan(content);

    if (!pilihan || pilihan.length < 5) {
      if (this.debug) {
        console.log(`Soal ${nomor}: Pilihan tidak lengkap (${pilihan.length} pilihan)`);
      }
      // Still create the question, but mark incomplete
      // return null;
    }

    // Phase 2: Extract teks dan pertanyaan
    const contentBeforeOptions = pilihanStart !== -1 ? content.slice(0, pilihanStart).trim() : content;
    const [teks, pertanyaan] = this.extractTeksDanPertanyaan(contentBeforeOptions);

    // Phase 3: Detect tipe soal
    const tipe = this.detectTipeSoal(teks, pertanyaan, pilihan);

    // Phase 4: Get kunci jawaban
    const [jawaban, pembahasan] = this.getKunciJawaban(nomor, kunciDict);

    return {
      nomor,
      subtest: tipe,
      text: teks,
      question: pertanyaan,
      option_a: pilihan[0] ? `(A) ${pilihan[0]}` : '',
      option_b: pilihan[1] ? `(B) ${pilihan[1]}` : '',
      option_c: pilihan[2] ? `(C) ${pilihan[2]}` : '',
      option_d: pilihan[3] ? `(D) ${pilihan[3]}` : '',
      option_e: pilihan[4] ? `(E) ${pilihan[4]}` : '',
      correct_answer: jawaban as any,
      explanation: pembahasan,
    };
  }

  /**
   * Extract pilihan jawaban A-E
   * Enhanced to handle both formats:
   * 1. Standard: "A. text" or "A text"
   * 2. Full notation: "(A) text" (less common but supported)
   */
  private extractPilihan(content: string): [number, string[]] {
    const lines = content.split('\n');
    const pilihan: string[] = [];
    let startIdx = -1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const stripped = line.trim();

      if (!stripped) continue;

      // Check if line starts with A-E (supports both "A." and "A " formats)
      const match = stripped.match(/^([A-E])[\.\s]+(.+)/);
      if (match) {
        const huruf = match[1];
        const teks = match[2].trim();

        // First option found
        if (startIdx === -1) {
          startIdx = content.indexOf(line);
          pilihan.length = 0;
        }

        // Validate sequence
        const expectedHuruf = String.fromCharCode(65 + pilihan.length); // A=65
        if (huruf === expectedHuruf) {
          pilihan.push(teks);

          // Stop if we have all 5
          if (pilihan.length === 5) break;
        } else {
          // Sequence broken, reset if incomplete
          if (pilihan.length < 5 && pilihan.length > 0) {
            // Only reset if this is truly a new sequence starting from A
            if (huruf === 'A') {
              pilihan.length = 0;
              pilihan.push(teks);
              startIdx = content.indexOf(line);
            }
          }
        }
      }
    }

    return [startIdx, pilihan];
  }

  /**
   * Extract teks dan pertanyaan
   * Enhanced for literasi format where text passage comes first
   */
  private extractTeksDanPertanyaan(content: string): [string, string] {
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);

    if (lines.length === 0) return ['', ''];

    const teksLines: string[] = [];
    let pertanyaan = '';
    let inTeksSection = false;
    let foundQuestion = false;

    // Check if content has numbered sentences (literasi format indicator)
    const hasNumberedSentences = content.match(/^\d+\s+[A-Z]/m);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip "Teks" or "Teks Bacaan" header
      if (/^Teks(?:\s+Bacaan)?(?:\s+\d+)?\s*:?$/i.test(line)) {
        inTeksSection = true;
        continue;
      }

      // For literasi format, numbered sentences are part of text passage
      if (hasNumberedSentences && /^\d+\s+/.test(line)) {
        teksLines.push(line);
        continue;
      }

      // Detect question line
      const isQuestion = this.isQuestionLine(line);

      if (isQuestion && !foundQuestion) {
        pertanyaan = line;
        foundQuestion = true;
        inTeksSection = false;
        continue;
      }

      // If we haven't found question yet, add to text
      if (!foundQuestion || inTeksSection) {
        teksLines.push(line);
      }
    }

    // Join teks
    let teks = teksLines.join(' ').trim();

    // Clean up numbered sentences - keep numbers for reference
    // Format: "1 Text here 2 More text" -> "1. Text here 2. More text"
    if (hasNumberedSentences) {
      teks = teks.replace(/(\d+)\s+([A-Z])/g, '$1. $2');
    }

    // If pertanyaan still empty, look for last question-like line in teks
    if (!pertanyaan && teksLines.length > 0) {
      for (let idx = teksLines.length - 1; idx >= 0; idx--) {
        if (this.isQuestionLine(teksLines[idx])) {
          pertanyaan = teksLines[idx];
          teksLines.splice(idx, 1);
          teks = teksLines.join(' ').trim();
          break;
        }
      }
    }

    // Fallback: last line becomes question
    if (!pertanyaan && teksLines.length > 1) {
      pertanyaan = teksLines[teksLines.length - 1];
      teksLines.pop();
      teks = teksLines.join(' ').trim();
    }

    return [teks, pertanyaan];
  }

  /**
   * Check if line is a question
   * Enhanced for literasi questions
   */
  private isQuestionLine(line: string): boolean {
    const lower = line.toLowerCase();
    
    // Remove leading numbers (for literasi format)
    const cleanLine = line.replace(/^\d+\.\s*/, '').toLowerCase();
    
    const indicators = [
      line.includes('?'),
      cleanLine.startsWith('manakah'),
      cleanLine.startsWith('berapa'),
      cleanLine.startsWith('apakah'),
      cleanLine.startsWith('bagaimana'),
      cleanLine.startsWith('siapakah'),
      cleanLine.startsWith('mana '),
      cleanLine.startsWith('di mana'),
      cleanLine.startsWith('kapan'),
      cleanLine.startsWith('mengapa'),
      cleanLine.startsWith('tentukan'),
      cleanLine.startsWith('jika'),
      cleanLine.startsWith('apabila'),
      lower.includes('yang benar'),
      lower.includes('yang salah'),
      lower.includes('yang tepat'),
      lower.includes('yang paling'),
      lower.includes('yang sesuai'),
      lower.includes('yang cocok'),
      lower.includes('yang relevan'),
      lower.includes('paling tepat'),
      lower.includes('paling sesuai'),
      lower.includes('paling cocok'),
      lower.includes('kesimpulan') && (line.includes('?') || lower.includes('mana')),
      // Literasi specific patterns
      lower.includes('kalimat mana'),
      lower.includes('bagian mana'),
      lower.includes('kata mana'),
      lower.includes('paragraf mana'),
      lower.includes('pernyataan mana'),
    ];

    return indicators.some((indicator) => indicator);
  }

  /**
   * Detect tipe soal
   * Enhanced for literasi detection
   */
  private detectTipeSoal(teks: string, pertanyaan: string, pilihan: string[]): string {
    const combined = (teks + ' ' + pertanyaan).toLowerCase();

    const scores: Record<string, number> = {
      'penalaran umum': 0,
      'penalaran matematika': 0,
      'literasi bahasa indonesia': 0,
    };

    // Strong literasi indicators (definitive match)
    const strongLiterasiIndicators = [
      'kalimat',
      'paragraf',
      'kata',
      'makna',
      'sinonim',
      'antonim',
      'ejaan',
      'tata bahasa',
      'konjungsi',
      'frasa',
      'klausa',
      'gagasan',
      'ide pokok',
      'teks bacaan',
      'bacaan di atas',
      'berdasarkan teks',
    ];

    for (const indicator of strongLiterasiIndicators) {
      if (combined.includes(indicator)) {
        scores['literasi bahasa indonesia'] += 10;
      }
    }

    // Check if text has numbered sentences (typical literasi format)
    if (/\d+\s+[A-Z]/.test(teks)) {
      scores['literasi bahasa indonesia'] += 5;
    }

    // Long text passages are typically literasi
    if (teks.length > 300) {
      scores['literasi bahasa indonesia'] += 3;
    }

    // Math keywords
    const mathKeywords = [
      'angka',
      'bilangan',
      'deret',
      'pola',
      'persentase',
      'keuntungan',
      'modal',
      'pendapatan',
      'hitung',
      'jumlah',
      'rata-rata',
      'total',
      'tahun ke',
      'hari ke',
      'berapa',
      '\\d+',
      'tambah',
      'kurang',
      'kali',
      'bagi',
      'perbandingan',
      'rasio',
    ];

    // Check number sequences
    if (/\d+\s*,\s*\d+\s*,\s*\d+/.test(combined)) {
      scores['penalaran matematika'] += 10;
    }

    for (const keyword of mathKeywords) {
      if (new RegExp(keyword).test(combined)) {
        scores['penalaran matematika'] += 1;
      }
    }

    // Bahasa keywords (weak indicators, only count if no strong literasi match)
    const bahasaKeywords = [
      'arti',
      'bahasa',
      'diksi',
      'gaya bahasa',
    ];

    for (const keyword of bahasaKeywords) {
      if (combined.includes(keyword)) {
        scores['literasi bahasa indonesia'] += 2;
      }
    }

    // Logic keywords
    const logicKeywords = [
      'korelasi',
      'simpulan',
      'kesimpulan',
      'benar',
      'salah',
      'memperlemah',
      'menguatkan',
      'pandangan',
      'pernyataan',
      'jika',
      'maka',
      'bila',
      'apabila',
      'sehingga',
      'argumen',
      'premis',
      'asumsi',
    ];

    for (const keyword of logicKeywords) {
      if (combined.includes(keyword)) {
        scores['penalaran umum'] += 1;
      }
    }

    // Default to literasi if no clear signal but has long text
    if (Math.max(...Object.values(scores)) === 0) {
      if (teks.length > 100) {
        scores['literasi bahasa indonesia'] = 1;
      } else {
        scores['penalaran umum'] = 1;
      }
    }

    // Return max score
    return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  }

  /**
   * Parse kunci jawaban
   * Ultra-flexible parser supporting various formats:
   * 1. "1. B (text) pembahasan..."
   * 2. "1.BPembahasan" or "1. BPembahasan" 
   * 3. "1.B Pembahasan" or "1. B Pembahasan"
   * 4. Mixed spacing variations
   */
  private parseKunciJawaban(text: string): Record<number, KunciJawaban> {
    const kunciDict: Record<number, KunciJawaban> = {};

    // Remove header
    text = text.replace(/^KUNCI\s+JAWABAN\s*/i, '');

    // Try format 1: "nomor. huruf (teks jawaban)" with pembahasan after
    const pattern1 = /(\d+)\.\s*([A-E])\s*\((.*?)\)/gm;
    const matches1 = Array.from(text.matchAll(pattern1));

    if (matches1.length > 0) {
      for (let i = 0; i < matches1.length; i++) {
        const match = matches1[i];
        const nomor = parseInt(match[1], 10);
        const huruf = match[2];

        // Extract pembahasan
        const start = match.index! + match[0].length;
        const end = i + 1 < matches1.length ? matches1[i + 1].index! : text.length;

        let pembahasan = text.slice(start, end).trim();

        // Clean pembahasan
        pembahasan = pembahasan.split(/\s+/).join(' ');

        kunciDict[nomor] = {
          jawaban: huruf,
          pembahasan,
        };
      }
      
      if (this.debug) {
        console.log(`Parsed ${Object.keys(kunciDict).length} kunci jawaban (format 1)`);
      }
      
      return kunciDict;
    }

    // Try format 2: Very flexible pattern
    // Matches: "1.B", "1. B", "1 .B", "1 . B" followed by text starting with capital letter
    // OR followed by lowercase (for edge cases)
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Pattern: number + optional spaces + dot + optional spaces + letter A-E
      const match = line.match(/^(\d+)\s*\.\s*([A-E])(.*)$/);
      
      if (match) {
        const nomor = parseInt(match[1], 10);
        const huruf = match[2];
        let pembahasan = match[3].trim();
        
        // Collect multi-line pembahasan
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          
          // Stop if we hit next answer number
          if (/^\d+\s*\.\s*[A-E]/.test(nextLine)) {
            break;
          }
          
          if (nextLine) {
            pembahasan += ' ' + nextLine;
          }
          j++;
        }
        
        // Clean pembahasan
        pembahasan = pembahasan.split(/\s+/).join(' ');
        
        kunciDict[nomor] = {
          jawaban: huruf,
          pembahasan,
        };
      }
    }

    if (this.debug) {
      console.log(`Parsed ${Object.keys(kunciDict).length} kunci jawaban (format 2)`);
      console.log('Parsed answers:', Object.keys(kunciDict).map(k => `${k}:${kunciDict[parseInt(k)]?.jawaban}`).join(', '));
    }

    return kunciDict;
  }

  /**
   * Get kunci jawaban
   */
  private getKunciJawaban(nomor: number, kunciDict: Record<number, KunciJawaban>): [string, string] {
    if (kunciDict[nomor]) {
      return [kunciDict[nomor].jawaban, kunciDict[nomor].pembahasan];
    }
    return ['', ''];
  }

  /**
   * Resolve references between questions
   */
  private resolveReferences(soalList: QuestionInternal[]): QuestionInternal[] {
    // Build lookup
    const soalDict: Record<number, QuestionInternal> = {};
    for (const soal of soalList) {
      soalDict[soal.nomor] = soal;
    }

    for (const soal of soalList) {
      // Check if text is empty or very short
      if (soal.text.length < 20 || !soal.text.trim()) {
        // Check question for reference pattern
        const match = soal.question.match(/[Ss]oal\s+(\d+)/);
        if (match) {
          const refNomor = parseInt(match[1], 10);

          if (soalDict[refNomor]) {
            soal.text = soalDict[refNomor].text;

            if (this.debug) {
              console.log(`✅ Soal ${soal.nomor}: Resolved reference to Soal ${refNomor}`);
            }
          }
        }
      }

      // Infer from question context
      if (soal.text.length < 20 && /berdasarkan/i.test(soal.question)) {
        const currentNomor = soal.nomor;
        for (let checkNomor = currentNomor - 1; checkNomor > Math.max(0, currentNomor - 5); checkNomor--) {
          if (soalDict[checkNomor] && soalDict[checkNomor].text.length > 50) {
            soal.text = soalDict[checkNomor].text;
            if (this.debug) {
              console.log(`✅ Soal ${soal.nomor}: Inferred reference to Soal ${checkNomor}`);
            }
            break;
          }
        }
      }

      // Fix question formatting
      if (soal.question.startsWith(',')) {
        let prefix = 'Berdasarkan informasi tersebut';
        if (/paragraf/i.test(soal.question)) {
          prefix = 'Berdasarkan paragraf tersebut';
        } else if (/data|tabel/i.test(soal.question)) {
          prefix = 'Berdasarkan data tersebut';
        } else if (/teks/i.test(soal.question)) {
          prefix = 'Berdasarkan teks tersebut';
        }

        soal.question = prefix + soal.question;

        if (this.debug) {
          console.log(`✅ Soal ${soal.nomor}: Fixed question formatting`);
        }
      }
    }

    return soalList;
  }
}

/**
 * Convenience function untuk parsing soal
 */
export function parseSoal(rawText: string, kunciText: string, debug = false): ParseResult {
  const parser = new SmartSoalParser(debug);
  return parser.parse(rawText, kunciText);
}

/**
 * Convert questions to JSON format
 */
export function toJSONFormat(questions: Question[], subtestOverride?: string): Question[] {
  return questions.map((q) => ({
    ...q,
    subtest: subtestOverride || q.subtest,
  }));
}
