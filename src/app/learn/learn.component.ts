import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { WordData, WordListService } from '../services/word-list.service';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss']
})
export class LearnComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['index', 'word', 'sounds'];
  dataSource!: MatTableDataSource<WordData>;

  words: WordData[] = []

  wordList!: string
  fromDay!: number
  toDay!: number

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private activatedRoute: ActivatedRoute, private wls: WordListService, private router: Router) {

  }

  ngOnInit(): void {
    if (this.wls.words.length == 0) {
      this.router.navigateByUrl('')
      return
    }

    // set default value
    this.fromDay = 0
    this.toDay = Math.ceil(this.wls.words.length / environment.target)

    this.activatedRoute.params.subscribe({
      next: params => {
        if (params['wordList']) {
          this.wordList = params['wordList']
        }

        if (params['fromDay']) {
          this.fromDay = +params['fromDay']
        }

        if (params['toDay']) {
          this.toDay = +params['toDay']
        }

        // build word data list
        this.buildWordDataList()
      }
    })
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  private buildWordDataList() {
    const fromIndex = this.fromDay * environment.target
    const toIndexTmp = fromIndex + (this.toDay - this.fromDay + 1) * environment.target

    let toIndex
    if (toIndexTmp > this.wls.words.length) {
      toIndex = this.wls.words.length
    } else {
      toIndex = toIndexTmp
    }

    this.words = this.wls.words.slice(fromIndex, toIndex).map((word, index) => {
      const wd: WordData = {
        index: index + 1,
        word: word
      }

      return wd
    })
    this.wls.wordDataList = this.words

    this.dataSource = new MatTableDataSource(this.words);
  }

  applyFilter(event: any, input?: HTMLInputElement) {
    let filterValue
    if (input) {
      filterValue = input.value
    } else {
      filterValue = (event.target as HTMLInputElement).value;
    }

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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


}
