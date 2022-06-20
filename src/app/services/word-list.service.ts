import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WordListService {
  words!: WordData[]
  selectedWords!: WordData[]

  constructor(private http: HttpClient) { }

  loadWordList(url: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap(res => {
        this.words = res.map((w, index) => {
          const word: WordData = {
            index: index + 1,
            word: w
          }
          return word
        })
      })
    )
  }

  soundOfText(word: string): Observable<SoundOfTextResponse> {
    return this.http.post<SoundOfTextResponse>('https://api.soundoftext.com/sounds',
      {
        engine: "Google",
        data: {
          text: word,
          voice: "en-US"
        }
      })
  }

  buildSelectedWords(fromDay: number, toDay: number): WordData[] {
    const fromIndex = fromDay * environment.target
    const toIndexTmp = fromIndex + (toDay - fromDay + 1) * environment.target

    let toIndex
    if (toIndexTmp > this.words.length) {
      toIndex = this.words.length
    } else {
      toIndex = toIndexTmp
    }

    this.selectedWords = this.words.slice(fromIndex, toIndex)
    return this.selectedWords
  }

  buildSoundUrl(sid: string): string {
    return `https://storage.soundoftext.com/${sid}.mp3`
  }
}

export interface SoundOfTextResponse {
  success: boolean
  id: string
}

export interface WordData {
  index: number
  word: string
  soundUrl?: string
}
