import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WordListService {
  words!: WordData[]
  selectedWords!: WordData[]
  sounds?: {[key: string]: string[]}

  constructor(private http: HttpClient) { }

  loadWordList(url: string): Observable<string[]> {
    return this.http.get<string[]>(url).pipe(
      tap(res => {
        this.words = res.map((w, index) => {
          const word: WordData = {
            index: index + 1,
            word: w,
            soundIndex: 0
          }
          return word
        })
      })
    )
  }

  soundOfText(word: string): Observable<string[]> {
    if (this.sounds) {
      return of(this.sounds[word])
    }

    return this.http.get<{[key: string]: string[]}>('assets/data/ultimate.json').pipe(
      map(sounds => {
        this.sounds = sounds
        return this.sounds[word]
      })
    )
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

}

export interface SoundOfTextResponse {
  success: boolean
  id: string
}

export interface WordData {
  index: number
  word: string
  soundUrls?: string[]
  soundIndex: number
}
