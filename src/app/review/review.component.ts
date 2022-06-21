import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { concatAll, delay, map, mergeMap, Observable, of, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WordData, WordListService } from '../services/word-list.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit, OnDestroy {
  private WORDS_SIZE: number = 5
  displayedColumns: string[] = ['index', 'word', 'sounds'];
  dataSource!: MatTableDataSource<WordData>;

  words: WordData[] = []

  private wordStream: Subject<WordData> = new Subject()
  private subscription!: Subscription

  constructor(private wls: WordListService, private router: Router) { }

  ngOnInit(): void {
    if (!this.wls.selectedWords) {
      this.router.navigateByUrl('')
      return
    }

    this.dataSource = new MatTableDataSource(this.words)
    this.randomize()
  }

  private randomize() {
    let subject = this.dataSource.connect()
    let shuffledWords: WordData[] = this.shuffle(this.wls.selectedWords)

    this.wordStream.pipe(
      mergeMap(wd => this.loadSoundOfText(wd)),
      map(wd => this.renderRows(wd, subject)),
      delay(environment.wordInterval),
      map(wd => {
        if (shuffledWords.length == 0) {
          shuffledWords = this.shuffle(this.wls.selectedWords)
        }

        let nextWord = shuffledWords.shift()
        this.wordStream.next(nextWord!!)

        return wd
      })
    ).subscribe({
      next: wd => console.log(wd)
    })

    this.wordStream.next(shuffledWords.shift()!!)
  }

  private shuffle(origin: any[]): any[] {
    let array = [...origin]

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    this.dataSource?.disconnect()
    this.wordStream.complete()
  }

  private renderRows(wd: WordData, subject: Subject<WordData[]>): WordData {
    if (this.words.length == this.WORDS_SIZE) {
      this.words.shift()
    }

    this.words.push(wd)
    subject.next(this.words)

    return wd
  }

  private loadSoundOfText(wd: WordData): Observable<WordData> {
    return this.wls.soundOfText(wd.word).pipe(
      map(res => {
        if (res.success) {
          wd.soundUrl = this.wls.buildSoundUrl(res.id)
        }

        return wd
      })
    )
  }

  soundOfText(wd: WordData, audio: HTMLAudioElement) {
    if (wd.soundUrl) {
      audio.play()
      return
    }

    this.wls.soundOfText(wd.word).subscribe({
      next: res => {
        if (res.success) {
          wd.soundUrl = `https://storage.soundoftext.com/${res.id}.mp3`
          audio.crossOrigin = 'anonymous'

          setTimeout(() => {
            audio.play()
          }, 0);
        }
      }
    })
  }

  isLastRow(wb: WordData) {
    return this.words.indexOf(wb) == this.words.length - 1
  }
}
